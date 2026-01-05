// Vercel Serverless Function to proxy SharePoint API calls
// This handles CORS and can be extended with authentication

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { apiPath, siteUrl, listName, userEmail } = req.query;

        if (!siteUrl) {
            return res.status(400).json({ error: 'Missing required parameter: siteUrl' });
        }

        // Build SharePoint API URL
        let sharePointUrl = '';
        
        if (apiPath) {
            // If full API path is provided, use it
            sharePointUrl = `${siteUrl}${apiPath}`;
        } else if (listName) {
            // Build URL based on list name
            switch (listName) {
                case 'SP_UserTotals':
                    sharePointUrl = `${siteUrl}/_api/web/lists/getbytitle('SP_UserTotals')/items?$select=ID,TotalPoints,Tier,EmployeeEmail/Email,EmployeeEmail/Title&$expand=EmployeeEmail&$orderby=TotalPoints desc`;
                    break;
                case 'SP_PointsLedger':
                    sharePointUrl = `${siteUrl}/_api/web/lists/getbytitle('SP_PointsLedger')/items?$select=ID,Points,ActionType,SourceApp,CreatedOn,EmployeeEmail/Email,EmployeeEmail/Title&$expand=EmployeeEmail&$orderby=CreatedOn desc&$top=100`;
                    break;
                case 'SP_Rewards':
                    sharePointUrl = `${siteUrl}/_api/web/lists/getbytitle('SP_Rewards')/items?$select=ID,Title,Description,PointsCost,AvailableQuantity,Status,Category&$filter=Status eq 'Active'&$orderby=PointsCost asc`;
                    break;
                case 'SP_Redemptions':
                    if (userEmail) {
                        sharePointUrl = `${siteUrl}/_api/web/lists/getbytitle('SP_Redemptions')/items?$select=ID,Title,Reward/Title,Reward/Id,PointsDeducted,Status,RequestDate,ApprovalDate,Employee/Email&$expand=Reward,Employee&$filter=Employee/Email eq '${userEmail}'&$orderby=RequestDate desc&$top=50`;
                    } else {
                        sharePointUrl = `${siteUrl}/_api/web/lists/getbytitle('SP_Redemptions')/items?$select=ID,Title,Reward/Title,Reward/Id,PointsDeducted,Status,RequestDate,ApprovalDate,Employee/Email&$expand=Reward,Employee&$orderby=RequestDate desc&$top=50`;
                    }
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid list name' });
            }
        } else {
            return res.status(400).json({ error: 'Missing apiPath or listName' });
        }

        // Forward the request to SharePoint
        // NOTE: This requires authentication. You'll need to:
        // 1. Add Azure AD authentication
        // 2. Or use environment variables for credentials
        // 3. Or use Managed Identity if running on Azure
        
        const response = await fetch(sharePointUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose'
                // Add authentication headers here when configured
                // 'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('SharePoint API error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: 'SharePoint API error', 
                status: response.status,
                details: errorText,
                note: 'SharePoint requires authentication. Configure Azure AD or use Managed Identity.'
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message 
        });
    }
}

