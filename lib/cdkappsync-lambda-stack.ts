import * as cdk from '@aws-cdk/core';
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from '@aws-cdk/aws-lambda';
import * as appsync from "@aws-cdk/aws-appsync";
import { PythonFunction } from "@aws-cdk/aws-lambda-python";


export class CdkappsyncLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const PREFIX_NAME = id.toLowerCase().replace('stack','')
    
    const role = new iam.Role(this, "role", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      roleName: "cdkevent-role",
    })

    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    )
    
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AWSCloudFormationReadOnlyAccess"
      )
    )
    
    const list_outputs_function = new PythonFunction(this, "list_outputs_function", {
      entry: "lambda",
      index: "list_outputs.py",
      handler: "lambda_handler",
      functionName: PREFIX_NAME + "-list_outputs",
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: cdk.Duration.seconds(30),
      role: role
    })
    
    const list_resources_function = new PythonFunction(this, "list_resources_function", {
      entry: "lambda",
      index: "list_resources.py",
      handler: "lambda_handler",
      functionName: PREFIX_NAME + "-list_resources",
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: cdk.Duration.seconds(30),
      role: role
    })
    
    const api = new appsync.GraphqlApi(this, "Api", {
      name: PREFIX_NAME + "-api",
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.IAM,
        },
      },
      schema: new appsync.Schema({
        filePath: "graphql/schema.graphql",
      }),
    })

    // Register Datasource and Resolver

    const lambda_outputs_datasource = api.addLambdaDataSource(
      "lambda_outputs_datasource",
      list_outputs_function
    )
    
    const lambda_resources_datasource = api.addLambdaDataSource(
      "lambda_resources_datasource",
      list_resources_function
    )

    lambda_outputs_datasource.createResolver({
      typeName: "Query",
      fieldName: "listOutputs",
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    })
    
    lambda_resources_datasource.createResolver({
      typeName: "Query",
      fieldName: "listResources",
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    })

  }
}
