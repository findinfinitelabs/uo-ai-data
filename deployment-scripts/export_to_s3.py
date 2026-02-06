#!/usr/bin/env python3
"""
Export healthcare datasets to S3
Can be used standalone or imported into Flask app
"""

try:
    import boto3
except ImportError:
    raise ImportError("boto3 is required to run this script. Please install it with 'pip install boto3'.")
import json
import os
from datetime import datetime
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

class DatasetExporter:
    def __init__(self, bucket_name, aws_region='us-east-1'):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client('s3', region_name=aws_region)
        self.dynamodb = boto3.resource('dynamodb', region_name=aws_region)
    
    def export_table(self, table_name, prefix=''):
        """Export a single DynamoDB table to S3"""
        table = self.dynamodb.Table(table_name)
        response = table.scan()
        items = response['Items']
        
        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{prefix}{table_name}_{timestamp}.json"
        
        # Convert to JSON
        json_data = json.dumps(items, indent=2, cls=DecimalEncoder)
        
        # Upload to S3
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=filename,
            Body=json_data,
            ContentType='application/json',
            Metadata={
                'table': table_name,
                'export_date': timestamp,
                'record_count': str(len(items))
            }
        )
        
        return {
            'filename': filename,
            'record_count': len(items),
            's3_uri': f"s3://{self.bucket_name}/{filename}"
        }
    
    def export_all_healthcare_tables(self, table_prefix='healthcare'):
        """Export all healthcare tables"""
        tables = [
            f'{table_prefix}-patients',
            f'{table_prefix}-diagnoses',
            f'{table_prefix}-medications',
            f'{table_prefix}-providers',
            f'{table_prefix}-patient-diagnoses',
            f'{table_prefix}-patient-medications'
        ]
        
        results = {}
        for table in tables:
            try:
                result = self.export_table(table, prefix='datasets/')
                results[table] = result
            except Exception as e:
                results[table] = {'error': str(e)}
        
        return results
    
    def export_query_results(self, query_text, response_data, llm_used='unknown'):
        """Export a specific query and its results"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"queries/query_{timestamp}.json"
        
        export_data = {
            'timestamp': timestamp,
            'query': query_text,
            'llm_used': llm_used,
            'response': response_data
        }
        
        json_data = json.dumps(export_data, indent=2, cls=DecimalEncoder)
        
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=filename,
            Body=json_data,
            ContentType='application/json',
            Metadata={
                'query_type': 'ai_interaction',
                'llm': llm_used,
                'timestamp': timestamp
            }
        )
        
        return {
            'filename': filename,
            's3_uri': f"s3://{self.bucket_name}/{filename}"
        }
    
    def export_conversation(self, messages, metadata=None):
        """Export a full conversation thread"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"conversations/conversation_{timestamp}.json"
        
        export_data = {
            'timestamp': timestamp,
            'messages': messages,
            'metadata': metadata or {}
        }
        
        json_data = json.dumps(export_data, indent=2, cls=DecimalEncoder)
        
        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=filename,
            Body=json_data,
            ContentType='application/json'
        )
        
        return {
            'filename': filename,
            's3_uri': f"s3://{self.bucket_name}/{filename}"
        }
    
    def list_exports(self, prefix=''):
        """List all exports in the bucket"""
        response = self.s3_client.list_objects_v2(
            Bucket=self.bucket_name,
            Prefix=prefix
        )
        
        if 'Contents' not in response:
            return []
        
        exports = []
        for obj in response['Contents']:
            exports.append({
                'key': obj['Key'],
                'size': obj['Size'],
                'last_modified': obj['LastModified'].isoformat(),
                's3_uri': f"s3://{self.bucket_name}/{obj['Key']}"
            })
        
        return exports

if __name__ == '__main__':
    # Example usage
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python3 export_to_s3.py <bucket-name> [table-prefix]")
        sys.exit(1)
    
    bucket_name = sys.argv[1]
    table_prefix = sys.argv[2] if len(sys.argv) > 2 else 'healthcare'
    
    exporter = DatasetExporter(bucket_name)
    
    print(f"Exporting all healthcare tables to {bucket_name}...")
    results = exporter.export_all_healthcare_tables(table_prefix)
    
    print("\nExport Results:")
    for table, result in results.items():
        if 'error' in result:
            print(f"  ✗ {table}: {result['error']}")
        else:
            print(f"  ✓ {table}: {result['record_count']} records → {result['s3_uri']}")
    
    print("\nDone!")
