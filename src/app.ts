import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MinioModule } from './client';
import { databaseConfig } from './config';
import { jwtConfig } from './config/jwt.config';
import { minioConfig } from './config/minio.config';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoryModule } from './modules/category/category.module';
import { LanguageModule } from './modules/language/language.module';
import { ModelModule } from './modules/model/model.module';
import { OrderModule } from './modules/order/order.module';
import { PermissionModule } from './modules/permission/permission.module';
import { ProductModule } from './modules/product/product.module';
import { PropertyModule } from './modules/properties/properties.module';
import { RoleModule } from './modules/role/role.module';
import { ShopModule } from './modules/shop/shop.module';
import { TranslateModule } from './modules/translate/translate.module';
import { UserModule } from './modules/user/user.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, minioConfig, jwtConfig]
    }),
    LanguageModule,
    TranslateModule,
    MinioModule,
    CategoryModule,
    PropertyModule,
    UserModule,
    ProductModule,
    WishlistModule,
    CartModule,
    OrderModule,
    AuthModule,
    ModelModule,
    PermissionModule,
    RoleModule,
    ShopModule
  ],
})
export class AppModule {}