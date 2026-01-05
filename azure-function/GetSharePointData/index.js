module.exports = async function (context, req) {
    const https = require('https');
    const querystring = require('querystring');
    
    const siteUrl = 'https://sakidan-my.sharepoint.com/personal/u_zahid_kidan_com';
    const listName = req.query.list || 'SP_UserTotals';
    
    // Build SharePoint REST API URL
    let apiUrl = '';
    if (listName === 'SP_UserTotals') {
        apiUrl = `${siteUrl}/_api/web/lists/getbytitle('SP_UserTotals')/items?$select=ID,TotalPoints,Tier,EmployeeEmail/Email,EmployeeEmail/Title&$expand=EmployeeEmail&$orderby=TotalPoints desc`;
    } else if (listName === 'SP_PointsLedger') {
        apiUrl = `${siteUrl}/_api/web/lists/getbytitle('SP_PointsLedger')/items?$select=ID,Points,ActionType,SourceApp,CreatedOn,EmployeeEmail/Email,EmployeeEmail/Title&$expand=EmployeeEmail&$orderby=CreatedOn desc&$top=100`;
    } else {
        context.res = {
            status: 400,
            body: { error: 'Invalid list name' }
        };
        return;
    }
    
    // Use Azure Function's managed identity or pass token
    // For now, return instructions
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: {
            message: 'Azure Function needs authentication setup',
            apiUrl: apiUrl,
            instructions: 'Configure managed identity or pass access token'
        }
    };
};

