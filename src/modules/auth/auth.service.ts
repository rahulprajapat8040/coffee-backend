import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../database/models/user.model.js';
import { DeviceInfo } from '../database/models/device-info.model.js';
import { LoginDTO, OTPReqDTO, SignupDTO } from './dto/auth.dto.js';
import { OTPService } from './otp.service.js';
import { responseSender } from '../../utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../utils/constant/response-message.constant.js';
import { Sequelize } from 'sequelize-typescript';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { DeviceType } from '../../utils/enums/enum.js';
import { Transaction } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(
    private readonly otpService: OTPService,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(DeviceInfo) private readonly deviceModel: typeof DeviceInfo,
    private readonly sequelize: Sequelize,
    private readonly jwtService: JwtService,
  ) {}

  async sendOTP(dto: OTPReqDTO) {
    const { email } = dto;
    const otp = await this.otpService.generateAuthOTP(email);
    return responseSender(RESPONSE_MESSAGE.OTP_SENT, HttpStatus.OK, true, otp);
  }

  async signup(dto: SignupDTO) {
    const {
      deviceId,
      deviceToken,
      deviceType,
      email,
      otp,
      firstName,
      lastName,
    } = dto;

    const user = await this.getUserByEmail(email);
    if(user){
      throw new BadRequestException(RESPONSE_MESSAGE.ACCOUNT_EXIST);
    }
    
    await this.otpService.verifyAuthOTP(email, otp);
    const res = await this.sequelize.transaction(async (tx) => {
      const user = await this.userModel.create(
        { firstName, lastName, email },
        { transaction: tx },
      );
      const { accessToken, refreshToken } = await this.upsertDeviceInfo(
        tx,
        deviceId,
        user.id,
        deviceType,
        otp,
        deviceToken,
      );
      return { accessToken, refreshToken };
    });
    return responseSender(
      RESPONSE_MESSAGE.ACCOUNT_CREATED,
      HttpStatus.CREATED,
      true,
      res,
    );
  }

  async login(dto: LoginDTO){
      const { deviceId, deviceToken, deviceType, email, otp } = dto;
      const user = await this.getUserByEmail(email);
      
      if(!user){
        throw new NotFoundException(RESPONSE_MESSAGE.ACCOUNT_NOT_FOUND);
      }
      
      await this.otpService.verifyAuthOTP(email, otp);
      const res = await this.sequelize.transaction(async(tx)=> {
        const { accessToken, refreshToken } = await this.upsertDeviceInfo(
          tx,
          deviceId,
          user.id,
          deviceType,
          otp,
          deviceToken,
        );
        return { accessToken, refreshToken };
      })
      return responseSender(
        RESPONSE_MESSAGE.LOGGED_IN,
        HttpStatus.OK,
        true,
        res,
      );
  }

  private async upsertDeviceInfo(
    transaction: Transaction,
    deviceId: string,
    userId: string,
    deviceType: DeviceType,
    otp: string,
    deviceToken?: string,
  ) {
    const { accessToken, refreshToken } = await this.generateAuthTokens(
      deviceId,
      userId,
    );
    const refreshHash = await argon.hash(refreshToken);
     await this.deviceModel.upsert(
       {
         deviceId,
         userId,
         refreshHash,
         deviceType,
         deviceToken,
         otp,
       },
       { transaction },
     );
    return { accessToken, refreshToken };
  }

  private async getUserByEmail(email: string){
    const res = await this.userModel.findOne({ where: { email } });
    return res;
  }

  private async generateAuthTokens(deviceId: string, userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { deviceId, userId },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '1d' },
      ),
      this.jwtService.signAsync(
        { deviceId, userId },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }
}
