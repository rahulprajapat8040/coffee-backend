import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../database/models/user.model.js';
import { DeviceInfo } from '../database/models/device-info.model.js';
import { LoginDTO, OTPReqDTO, SignupDTO } from './dto/auth.dto.js';
import { OTPService } from './otp.service.js';
import { responseSender } from '../../lib/utils/helper/function.helper.js';
import { RESPONSE_MESSAGE } from '../../lib/utils/constant/response-message.constant.js';
import { Sequelize } from 'sequelize-typescript';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { DeviceType } from '../../lib/utils/enums/enum.js';
import { Transaction } from 'sequelize';
import { IAuthUser, IJwtPayload } from '../../lib/interfaces/auth.interface.js';

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
    console.log('ddd', dto);
    const { email } = dto;
    const otp = await this.otpService.generateAuthOTP(email);
    return responseSender(RESPONSE_MESSAGE.OTP_SENT, HttpStatus.OK, true, otp);
  }

  async signup(dto: SignupDTO) {
    const { deviceId, deviceToken, deviceType, email, otp, name } = dto;

    const user = await this.getUserByEmail(email);
    if (user) {
      throw new BadRequestException(RESPONSE_MESSAGE.ACCOUNT_EXIST);
    }

    await this.otpService.verifyAuthOTP(email, otp);
    const res = await this.sequelize.transaction(async (tx) => {
      const user = await this.userModel.create(
        { name, email },
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

  async login(dto: LoginDTO) {
    const { deviceId, deviceToken, deviceType, email, otp } = dto;
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new NotFoundException(RESPONSE_MESSAGE.ACCOUNT_NOT_FOUND);
    }

    await this.otpService.verifyAuthOTP(email, otp);

    const res = await this.sequelize.transaction(async (tx) => {
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

    return responseSender(RESPONSE_MESSAGE.LOGGED_IN, HttpStatus.OK, true, res);
  }

  async getUser(user: IAuthUser) {
    const res = await this.userModel.findByPk(user.id, {
      attributes: [
        'id',
        'name',
        'email',
        'countryCode',
        'phoneNo',
        'profilePic',
        'role',
      ],
    });
    if (!res) {
      throw new ForbiddenException(RESPONSE_MESSAGE.ACCOUNT_NOT_FOUND);
    }
    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
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

  private async getUserByEmail(email: string) {
    const res = await this.userModel.findOne({ where: { email } });
    return res;
  }

  async refreshTokens(user: IJwtPayload & { refreshToken: string }) {
    const tokens = await this.sequelize.transaction(async (transaction) => {
      const device = await this.deviceModel.findOne({
        where: { deviceId: user.deviceId, userId: user.userId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!device || !(await argon.verify(device.refreshHash, user.refreshToken))) {
        throw new UnauthorizedException('Refresh token is invalid or expired');
      }

      const refreshed = await this.generateAuthTokens(
        user.deviceId,
        user.userId,
      );
      await device.update(
        { refreshHash: await argon.hash(refreshed.refreshToken) },
        { transaction },
      );
      return refreshed;
    });

    return responseSender(
      RESPONSE_MESSAGE.DATA_FETCHED,
      HttpStatus.OK,
      true,
      tokens,
    );
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
