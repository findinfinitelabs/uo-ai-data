#!/usr/bin/env python3
"""
Test AWS Bedrock access and models
"""

import boto3
import json
import sys

def test_bedrock(region):
    print(f"🧪 Testing AWS Bedrock in {region}")
    print("="*50)
    
    bedrock = boto3.client('bedrock', region_name=region)
    bedrock_runtime = boto3.client('bedrock-runtime', region_name=region)
    
    # List available models
    print("\n1. Listing available models...")
    try:
        response = bedrock.list_foundation_models()
        models = response['modelSummaries']
        print(f"✓ Found {len(models)} models")
        
        # Show first few models
        print("\nAvailable models (first 5):")
        for model in models[:5]:
            print(f"  - {model['modelId']}")
            print(f"    Provider: {model['providerName']}")
            print(f"    Input: {model.get('inputModalities', ['text'])}")
            print(f"    Output: {model.get('outputModalities', ['text'])}")
            print()
    except Exception as e:
        print(f"✗ Error listing models: {str(e)}")
        return False
    
    # Test Claude model
    print("\n2. Testing Claude 3 Haiku...")
    try:
        prompt = "What is HIPAA in one sentence?"
        
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        })
        
        response = bedrock_runtime.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0',
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        answer = response_body['content'][0]['text']
        
        print(f"✓ Claude response: {answer}")
        
    except Exception as e:
        print(f"✗ Error testing Claude: {str(e)}")
        print("\nNote: You may need to request access to Claude models:")
        print(f"  https://console.aws.amazon.com/bedrock/home?region={region}#/modelaccess")
    
    # Test Llama model
    print("\n3. Testing Llama 3...")
    try:
        prompt = "What is AI? Answer in one sentence."
        
        body = json.dumps({
            "prompt": prompt,
            "max_gen_len": 512,
            "temperature": 0.5,
        })
        
        response = bedrock_runtime.invoke_model(
            modelId='meta.llama3-8b-instruct-v1:0',
            body=body
        )
        
        response_body = json.loads(response['body'].read())
        answer = response_body['generation']
        
        print(f"✓ Llama response: {answer}")
        
    except Exception as e:
        print(f"⚠ Llama not available: {str(e)}")
    
    print("\n✅ Bedrock testing complete!")
    return True

if __name__ == "__main__":
    region = sys.argv[1] if len(sys.argv) > 1 else 'us-east-1'
    test_bedrock(region)
