import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

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
    // '/Users/cube/Desktop/nodejs-aws-cart-api/src/main_lambda.ts';
    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: cartApiLambda.functionName,
    });

    // Output the Lambda function ARN
    new cdk.CfnOutput(this, 'LambdaFunctionARN', {
      value: cartApiLambda.functionArn,
    });
  }
}

const app = new cdk.App();
new CartApiStack(app, 'InfrastructureStack', {});
