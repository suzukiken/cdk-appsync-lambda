import boto3

cloudformation_resource = boto3.resource('cloudformation')
cloudformation_client = boto3.client('cloudformation')

def lambda_handler(event, context):
    
    stack_names = []
    next_token = None
    exclude_status = ('DELETE_COMPLETE', 'CREATE_FAILED', 'CREATE_PENDING', 'CREATE_IN_PROGRESS', 'DELETE_PENDING', 'DELETE_IN_PROGRESS', 'DELETE_FAILED', 'FAILED', 'DELETE_SKIPPED', 'DELETE_SKIPPED')

    while True:
        if next_token:
            res = cloudformation_client.list_stacks(NextToken=next_token)
        else:
            res = cloudformation_client.list_stacks()
        for summary in res['StackSummaries']:
            if not summary['StackStatus'] in exclude_status:
                stack_names.append(summary['StackName'])
        
        next_token = res.get('NextToken')
        
        if not next_token:
            break

    resource_types = [
        'AWS::ApiGateway::RestApi', 
        'AWS::Lambda::Function',
        'AWS::Cognito::UserPool',
        'AWS::Cognito::IdentityPool',
        'AWS::AppSync::GraphQLApi',
        'AWS::DynamoDB::Table',
        'AWS::Elasticsearch::Domain',
        'AWS::IAM::Role',
        'AWS::Lambda::Function',
        'AWS::SNS::Topic',
        'AWS::SQS::Queue'
    ]
    
    resourcelist = []
    
    for stack_name in stack_names:
        stack = cloudformation_resource.Stack(stack_name)
        resource = stack.resource_summaries.all()
        
        for res in resource:
            if res.resource_type in resource_types:
                resourcelist.append({
                    'stack_name': stack_name,
                    'resource_type': res.resource_type, 
                    'physical_id': res.physical_resource_id
                })

    return resourcelist
    