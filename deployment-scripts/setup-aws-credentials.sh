#!/bin/bash

#####################################################################
# AWS Credentials Setup Guide
# Helps users configure AWS credentials for deployment
#####################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

clear
echo -e "${BOLD}${CYAN}============================================${NC}"
echo -e "${BOLD}${CYAN}   AWS Credentials Setup${NC}"
echo -e "${BOLD}${CYAN}============================================${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI not found!${NC}"
    echo ""
    echo "Please install AWS CLI first:"
    echo ""
    echo "macOS:"
    echo "  brew install awscli"
    echo ""
    echo "Linux:"
    echo "  curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "  unzip awscliv2.zip"
    echo "  sudo ./aws/install"
    echo ""
    echo "Windows:"
    echo "  Download from: https://aws.amazon.com/cli/"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI installed${NC}"
echo ""

# Check current AWS configuration
echo -e "${BLUE}Checking current AWS configuration...${NC}"
echo ""

if aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}✓ AWS credentials are already configured!${NC}"
    echo ""
    CURRENT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
    CURRENT_USER=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null)
    CURRENT_REGION=$(aws configure get region 2>/dev/null || echo "us-east-1")
    
    echo "Current Configuration:"
    echo "  Account ID: ${CURRENT_ACCOUNT}"
    echo "  User/Role:  ${CURRENT_USER}"
    echo "  Region:     ${CURRENT_REGION}"
    echo ""
    
    read -p "Do you want to use this configuration? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy](es)?$ ]]; then
        echo ""
        echo -e "${GREEN}✓ Using existing AWS configuration${NC}"
        echo ""
        echo "You're ready to deploy!"
        echo "Run: ./deploy-all.sh"
        exit 0
    fi
fi

echo -e "${YELLOW}No valid AWS credentials found or user wants to reconfigure.${NC}"
echo ""

# Guide user through setup
echo -e "${BOLD}AWS Authentication Options:${NC}"
echo ""
echo "1. IAM User (Access Key + Secret Key)"
echo "2. Federated/SSO Account (Recommended for enterprise)"
echo "3. AWS Profile (Use existing named profile)"
echo "4. Environment Variables (Temporary credentials)"
echo ""
read -p "Select option (1-4): " AUTH_OPTION

case $AUTH_OPTION in
    1)
        echo ""
        echo -e "${BOLD}${BLUE}Setting up IAM User credentials${NC}"
        echo ""
        echo "You'll need:"
        echo "  1. AWS Access Key ID"
        echo "  2. AWS Secret Access Key"
        echo ""
        echo "To create these:"
        echo "  1. Go to AWS Console → IAM → Users → Your User"
        echo "  2. Click 'Security credentials' tab"
        echo "  3. Click 'Create access key'"
        echo "  4. Copy both keys (you won't see the secret again!)"
        echo ""
        read -p "Press Enter when you have your keys ready..."
        echo ""
        
        read -p "Enter AWS Access Key ID: " ACCESS_KEY
        read -s -p "Enter AWS Secret Access Key: " SECRET_KEY
        echo ""
        read -p "Enter default region (e.g., us-east-1): " AWS_REGION
        echo ""
        
        # Configure AWS CLI
        aws configure set aws_access_key_id "$ACCESS_KEY"
        aws configure set aws_secret_access_key "$SECRET_KEY"
        aws configure set region "$AWS_REGION"
        aws configure set output json
        
        # Verify
        if aws sts get-caller-identity &> /dev/null; then
            echo ""
            echo -e "${GREEN}✓ AWS credentials configured successfully!${NC}"
            ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
            echo "  Account ID: ${ACCOUNT}"
        else
            echo ""
            echo -e "${RED}✗ Failed to verify credentials. Please check and try again.${NC}"
            exit 1
        fi
        ;;
    
    2)
        echo ""
        echo -e "${BOLD}${BLUE}Setting up Federated/SSO Account${NC}"
        echo ""
        echo "Federated accounts use temporary credentials via SSO."
        echo ""
        echo -e "${YELLOW}Setup Steps:${NC}"
        echo ""
        echo "1. Configure AWS SSO:"
        echo "   aws configure sso"
        echo ""
        echo "   You'll need:"
        echo "     - SSO start URL (from your organization)"
        echo "     - SSO region"
        echo "     - Your account ID (e.g., 375523929321)"
        echo ""
        echo "2. Login to SSO:"
        echo "   aws sso login --profile YOUR_PROFILE_NAME"
        echo ""
        echo "3. Set environment variable:"
        echo "   export AWS_PROFILE=YOUR_PROFILE_NAME"
        echo ""
        echo "4. Verify access:"
        echo "   aws sts get-caller-identity"
        echo ""
        read -p "Have you completed SSO setup? (yes/no): " -r
        
        if [[ $REPLY =~ ^[Yy](es)?$ ]]; then
            echo ""
            read -p "Enter your AWS SSO profile name: " SSO_PROFILE
            
            # Try to use the profile
            if aws sts get-caller-identity --profile "$SSO_PROFILE" &> /dev/null; then
                echo ""
                echo -e "${GREEN}✓ SSO profile verified!${NC}"
                echo ""
                echo "Add this to your shell profile (~/.bashrc or ~/.zshrc):"
                echo "  export AWS_PROFILE=$SSO_PROFILE"
                echo ""
                export AWS_PROFILE="$SSO_PROFILE"
                echo "AWS_PROFILE=$SSO_PROFILE" >> config.env
                echo -e "${GREEN}✓ Updated config.env with AWS_PROFILE${NC}"
            else
                echo ""
                echo -e "${YELLOW}⚠ Could not verify profile. You may need to login:${NC}"
                echo "  aws sso login --profile $SSO_PROFILE"
                exit 1
            fi
        else
            echo ""
            echo "Please complete SSO setup first, then run this script again."
            exit 1
        fi
        ;;
    
    3)
        echo ""
        echo -e "${BOLD}${BLUE}Using AWS Profile${NC}"
        echo ""
        echo "Available profiles:"
        aws configure list-profiles 2>/dev/null || echo "  (no profiles found)"
        echo ""
        read -p "Enter profile name to use: " PROFILE_NAME
        
        if aws sts get-caller-identity --profile "$PROFILE_NAME" &> /dev/null; then
            echo ""
            echo -e "${GREEN}✓ Profile verified!${NC}"
            export AWS_PROFILE="$PROFILE_NAME"
            echo "AWS_PROFILE=$PROFILE_NAME" >> config.env
            echo -e "${GREEN}✓ Updated config.env with AWS_PROFILE${NC}"
        else
            echo ""
            echo -e "${RED}✗ Could not access profile: $PROFILE_NAME${NC}"
            exit 1
        fi
        ;;
    
    4)
        echo ""
        echo -e "${BOLD}${BLUE}Using Environment Variables${NC}"
        echo ""
        echo "Set these environment variables with your temporary credentials:"
        echo ""
        echo "  export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY"
        echo "  export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY"
        echo "  export AWS_SESSION_TOKEN=YOUR_SESSION_TOKEN"
        echo "  export AWS_REGION=us-east-1"
        echo ""
        echo "Note: Temporary credentials expire (usually after 1-12 hours)."
        echo ""
        read -p "Have you set these variables? (yes/no): " -r
        
        if [[ $REPLY =~ ^[Yy](es)?$ ]]; then
            if aws sts get-caller-identity &> /dev/null; then
                echo ""
                echo -e "${GREEN}✓ Credentials verified!${NC}"
            else
                echo ""
                echo -e "${RED}✗ Could not verify credentials${NC}"
                exit 1
            fi
        else
            echo "Please set environment variables and try again."
            exit 1
        fi
        ;;
    
    *)
        echo ""
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

# Final verification
echo ""
echo -e "${BOLD}${CYAN}============================================${NC}"
echo -e "${BOLD}${CYAN}   Verifying AWS Access${NC}"
echo -e "${BOLD}${CYAN}============================================${NC}"
echo ""

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
USER_ARN=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null)
REGION=$(aws configure get region 2>/dev/null || echo "us-east-1")

if [ -z "$ACCOUNT_ID" ]; then
    echo -e "${RED}✗ Could not verify AWS access${NC}"
    exit 1
fi

echo -e "${GREEN}✓ AWS credentials are working!${NC}"
echo ""
echo "Configuration Summary:"
echo "  Account ID: ${ACCOUNT_ID}"
echo "  Identity:   ${USER_ARN}"
echo "  Region:     ${REGION}"
echo ""

# Check required permissions (basic check)
echo "Checking permissions..."
echo ""

REQUIRED_SERVICES=("eks" "ec2" "dynamodb" "s3" "iam" "bedrock-runtime")
ALL_GOOD=true

for service in "${REQUIRED_SERVICES[@]}"; do
    case $service in
        eks)
            if aws eks list-clusters --region "$REGION" &> /dev/null; then
                echo -e "  ${GREEN}✓${NC} EKS access"
            else
                echo -e "  ${RED}✗${NC} EKS access (required)"
                ALL_GOOD=false
            fi
            ;;
        ec2)
            if aws ec2 describe-vpcs --region "$REGION" &> /dev/null; then
                echo -e "  ${GREEN}✓${NC} EC2 access"
            else
                echo -e "  ${RED}✗${NC} EC2 access (required)"
                ALL_GOOD=false
            fi
            ;;
        dynamodb)
            if aws dynamodb list-tables --region "$REGION" &> /dev/null; then
                echo -e "  ${GREEN}✓${NC} DynamoDB access"
            else
                echo -e "  ${RED}✗${NC} DynamoDB access (required)"
                ALL_GOOD=false
            fi
            ;;
        s3)
            if aws s3 ls &> /dev/null; then
                echo -e "  ${GREEN}✓${NC} S3 access"
            else
                echo -e "  ${RED}✗${NC} S3 access (required)"
                ALL_GOOD=false
            fi
            ;;
        iam)
            if aws iam list-roles --max-items 1 &> /dev/null; then
                echo -e "  ${GREEN}✓${NC} IAM access"
            else
                echo -e "  ${YELLOW}⚠${NC} IAM access (may be needed)"
            fi
            ;;
        bedrock-runtime)
            if aws bedrock-runtime list-foundation-models --region "$REGION" &> /dev/null; then
                echo -e "  ${GREEN}✓${NC} Bedrock access"
            else
                echo -e "  ${YELLOW}⚠${NC} Bedrock access (optional)"
            fi
            ;;
    esac
done

echo ""

if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}✓ All required permissions verified!${NC}"
    echo ""
    echo -e "${BOLD}You're ready to deploy!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Copy config.env.example to config.env"
    echo "     cp config.env.example config.env"
    echo ""
    echo "  2. Edit config.env if needed (optional)"
    echo "     nano config.env"
    echo ""
    echo "  3. Run deployment:"
    echo "     ./deploy-all.sh"
    echo ""
else
    echo -e "${YELLOW}⚠ Some permissions may be missing${NC}"
    echo ""
    echo "You may need to:"
    echo "  1. Request additional IAM permissions from your AWS administrator"
    echo "  2. Required policies: EKS, EC2, DynamoDB, S3"
    echo "  3. Optional: Bedrock access for managed AI"
    echo ""
    echo "Contact your AWS admin with this info:"
    echo "  Account: ${ACCOUNT_ID}"
    echo "  User: ${USER_ARN}"
    echo "  Required: AdministratorAccess or custom policy with EKS/EC2/DynamoDB/S3 permissions"
    echo ""
fi
