import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class DatabaseSyncService implements OnApplicationBootstrap {
  constructor(private readonly sequelize: Sequelize) {}

  async onApplicationBootstrap() {
    await this.sequelize.sync();
    await this.migrateLegacyOrderItems();
    await this.sequelize.sync({ alter: true });
  }

  private async migrateLegacyOrderItems() {
    await this.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = current_schema()
            AND table_name = 'Order'
            AND column_name = 'items'
        ) THEN
          INSERT INTO "OrderItem" (
            "id", "order_id", "coffee_id", "variant_id", "name", "size",
            "image", "price", "quantity", "created_at", "updated_at"
          )
          SELECT
            md5(
              random()::text || clock_timestamp()::text ||
              orders."id"::text || item::text
            )::uuid,
            orders."id",
            (item ->> 'coffeeId')::uuid,
            (item ->> 'variantId')::uuid,
            item ->> 'name',
            item ->> 'size',
            item ->> 'image',
            CASE
              WHEN (item ->> 'price') ~ '^[0-9]+([.][0-9]{1,2})?$'
                THEN (item ->> 'price')::numeric(10,2)
              ELSE 0::numeric(10,2)
            END,
            (item ->> 'quantity')::integer,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
          FROM "Order" AS orders
          CROSS JOIN LATERAL jsonb_array_elements(
            CASE
              WHEN jsonb_typeof(orders."items") = 'array' THEN orders."items"
              ELSE '[]'::jsonb
            END
          ) AS order_items(item)
          WHERE NOT EXISTS (
            SELECT 1
            FROM "OrderItem" AS existing
            WHERE existing."order_id" = orders."id"
          );
        END IF;
      END
      $$;
    `);
  }
}
