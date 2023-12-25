import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as dotenv from 'dotenv';

dotenv.config();

export class CartApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cartApiLambda = new NodejsFunction(this, 'CartApiLambda', {
      runtime: Runtime.NODEJS_18_X,
      functionName: 'CartService',
      entry: 'dist/main.js',
      bundling: {
        externalModules: [
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices/microservices-module',
          '@nestjs/microservices',
          'better-sqlite3',
          'mysql2',
          'pg-query-stream',
          'mysql',
          'sqlite3',
          'tedious',
          'oracledb',
        ],
      },
      environment: {
        PG_ENDPOINT: process.env.DB_ENDPOINT,
        PG_PORT: process.env.DB_PORT,
        PG_DB: process.env.DB_DB,
        PG_DB_USER: process.env.DB_USER,
        PG_PASSWORD: process.env.DB_PASSWORD,
      },
    });

    const cartApi = new apiGateway.HttpApi(this, 'CartApi', {
      corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [apiGateway.CorsHttpMethod.ANY],
      },
    });

    cartApi.addRoutes({
      path: '/{proxy+}',
      methods: [apiGateway.HttpMethod.ANY],
      integration: new HttpLambdaIntegration(
        'CartServiceProxyIntegration',
        cartApiLambda,
      ),
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: cartApiLambda.functionName,
    });

    new cdk.CfnOutput(this, 'LambdaFunctionARN', {
      value: cartApiLambda.functionArn,
    });

    new cdk.CfnOutput(this, 'CartApiUrl', {
      value: cartApi.url ?? 'Something went wrong.',
    });
  }
}

const app = new cdk.App();
new CartApiStack(app, 'InfrastructureStack', {});
