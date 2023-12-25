import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
require('dotenv').config();

export class CartApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cartApiLambda = new NodejsFunction(this, 'CartApiLambda', {
      runtime: Runtime.NODEJS_18_X,
      functionName: 'CartService',
      entry: 'dist/main.js',
      timeout: cdk.Duration.seconds(15),

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
      initialPolicy: [
        new PolicyStatement({
          actions: ['rds-db:connect', 'rds-db:executeStatement'],
          resources: ['*'],
        }),
      ],
      environment: {
        PG_ENDPOINT: process.env.PG_ENDPOINT,
        PG_PORT: process.env.PG_PORT,
        PG_DB: process.env.PG_DB,
        PG_USER: process.env.PG_USER,
        PG_PASSWORD: process.env.PG_PASSWORD,
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
