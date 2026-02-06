#!/bin/bash

#####################################################################
# IAM Policy Creation Script
# Creates the IAM policy needed for Healthcare AI deployment
#####################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   IAM Policy Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

POLICY_NAME="HealthcareAI-Deployment-Policy"
POLICY_FILE="iam-policy-healthcare-ai.json"

# Check if policy file exists
if [ ! -f "$POLICY_FILE" ]; then
    echo -e "${RED}✗ Policy file not found: $POLICY_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found policy file${NC}"
echo ""

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}✗ AWS credentials not configured${NC}"
    echo "Please run: ./setup-aws-credentials.sh"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account: $ACCOUNT_ID"
echo ""

# Check if user has permission to create policies
echo "Checking IAM permissions..."
if ! aws iam list-policies --max-items 1 &> /dev/null; then
    echo -e "${YELLOW}⚠ You don't have permission to create IAM policies${NC}"
    echo ""
    echo "Option 1: Ask your AWS administrator to create this policy"
    echo "  Policy file: $POLICY_FILE"
    echo "  Policy name: $POLICY_NAME"
    echo ""
    echo "Option 2: Send them this command:"
    echo "  aws iam create-policy \\"
    echo "    --policy-name $POLICY_NAME \\"
    echo "    --policy-document file://$POLICY_FILE \\"
    echo "    --description 'Permissions for Healthcare AI Infrastructure deployment'"
    echo ""
    echo "Then have them attach it to your user/role:"
    echo "  aws iam attach-user-policy \\"
    echo "    --user-name YOUR_USERNAME \\"
    echo "    --policy-arn arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ You have IAM permissions${NC}"
echo ""

# Check if policy already exists
EXISTING_POLICY=$(aws iam list-policies --scope Local --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text)

if [ ! -z "$EXISTING_POLICY" ]; then
    echo -e "${YELLOW}⚠ Policy already exists: $EXISTING_POLICY${NC}"
    echo ""
    read -p "Do you want to create a new version? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy](es)?$ ]]; then
        # Delete oldest non-default version if at limit (max 5 versions)
        VERSION_COUNT=$(aws iam list-policy-versions --policy-arn "$EXISTING_POLICY" --query 'length(Versions)' --output text)
        if [ "$VERSION_COUNT" -ge 5 ]; then
            OLD_VERSION=$(aws iam list-policy-versions --policy-arn "$EXISTING_POLICY" --query 'Versions[?IsDefaultVersion==`false`]|[0].VersionId' --output text)
            aws iam delete-policy-version --policy-arn "$EXISTING_POLICY" --version-id "$OLD_VERSION"
            echo -e "${GREEN}✓ Deleted old version: $OLD_VERSION${NC}"
        fi
        
        # Create new version
        aws iam create-policy-version \
            --policy-arn "$EXISTING_POLICY" \
            --policy-document file://$POLICY_FILE \
            --set-as-default
        
        echo -e "${GREEN}✓ Updated policy with new version${NC}"
        POLICY_ARN="$EXISTING_POLICY"
    else
        POLICY_ARN="$EXISTING_POLICY"
        echo "Using existing policy."
    fi
else
    # Create new policy
    echo "Creating IAM policy: $POLICY_NAME"
    POLICY_ARN=$(aws iam create-policy \
        --policy-name "$POLICY_NAME" \
        --policy-document file://$POLICY_FILE \
        --description "Permissions for Healthcare AI Infrastructure deployment on EKS with Ollama, Bedrock, DynamoDB, and S3" \
        --query 'Policy.Arn' \
        --output text)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Policy created successfully${NC}"
    else
        echo -e "${RED}✗ Failed to create policy${NC}"
        exit 1
    fi
fi

echo ""
echo "Policy ARN: $POLICY_ARN"
echo ""

# Offer to attach to current user (if applicable)
CURRENT_USER_ARN=$(aws sts get-caller-identity --query Arn --output text)

if [[ $CURRENT_USER_ARN == *"user/"* ]]; then
    # It's an IAM user
    USER_NAME=$(echo $CURRENT_USER_ARN | sed 's/.*user\///')
    echo -e "${BLUE}Detected IAM user: $USER_NAME${NC}"
    echo ""
    read -p "Do you want to attach this policy to your user? (yes/no): " -r
    
    if [[ $REPLY =~ ^[Yy](es)?$ ]]; then
        aws iam attach-user-policy \
            --user-name "$USER_NAME" \
            --policy-arn "$POLICY_ARN"
        
        echo -e "${GREEN}✓ Policy attached to user: $USER_NAME${NC}"
    fi
elif [[ $CURRENT_USER_ARN == *"assumed-role/"* ]]; then
    # It's a federated/assumed role
    ROLE_NAME=$(echo $CURRENT_USER_ARN | sed 's/.*assumed-role\/\([^/]*\).*/\1/')
    echo -e "${BLUE}Detected federated role: $ROLE_NAME${NC}"
    echo ""
    echo "To attach this policy to your role, ask your AWS administrator to run:"
    echo ""
    echo "  aws iam attach-role-policy \\"
    echo "    --role-name $ROLE_NAME \\"
    echo "    --policy-arn $POLICY_ARN"
    echo ""
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Policy Setup Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify policy is attached to your user/role"
echo "  2. Run deployment: ./deploy-all.sh"
echo ""
echo "Policy ARN for reference:"
echo "  $POLICY_ARN"
echo ""
