import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export class CartApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cartApiLambda = new NodejsFunction(this, 'CartApiLambda', {
      runtime: Runtime.NODEJS_18_X,
      functionName: 'CartService',
      entry: 'dist/main.js',
      bundling: {
        // NOTE: Adjust the following 'externalModules' option based on your dependencies
        externalModules: [
          '@nestjs/websockets/socket-module',
          '@nestjs/microservices/microservices-module',
          '@nestjs/microservices',
          // ... any other modules that should not be bundled
        ],
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
    // '/Users/cube/Desktop/nodejs-aws-cart-api/src/main_lambda.ts';
    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: cartApiLambda.functionName,
    });

    // Output the Lambda function ARN
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
