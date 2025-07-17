module.exports = function mapGenericPromptsToWhere(message, table) {
    message = message.toLowerCase();
    let conditions = [];

    if (table === 'onboard_Employees') {
        // Gender
        if (/\bmale\b/.test(message)) conditions.push("gender = 'Male'");
        if (/\bfemale\b/.test(message)) conditions.push("gender = 'Female'");

        // Department
        if (/\bit\b/.test(message)) conditions.push("department = 'IT'");
        if (/\bfinance\b/.test(message)) conditions.push("department = 'Finance'");
        if (/\bsales\b/.test(message)) conditions.push("department = 'Sales'");
        if (/\bhr\b/.test(message)) conditions.push("department = 'HR'");

        // Status
        if (/\bapproved\b/.test(message)) conditions.push("status = 'Approved'");
        if (/\bpending\b/.test(message)) conditions.push("status = 'Pending'");
        if (/\brejected\b/.test(message)) conditions.push("status = 'Rejected'");

        // Join Date Patterns (broad, flexible)
        if (message.includes('joined after april 2025')) {
            conditions.push("joindate >= '2025-04-01' AND joindate <= '2025-04-30'");
        }
        if (message.includes('joined after january 2025')) {
            conditions.push("joindate >= '2025-01-01'");
        }
        if (message.includes('joined after 2025')) {
            conditions.push("joindate >= '2025-01-01'");
        }
        if (message.includes('joined after 2024')) {
            conditions.push("joindate >= '2024-01-01'");
        }
        if (message.includes('joined after 2023')) {
            conditions.push("joindate >= '2023-01-01'");
        }
        if (message.includes('joined after 2022')) {
            conditions.push("joindate >= '2022-01-01'");
        }

        // Age Conditions
        if (/\bover 20\b/.test(message)) {
            conditions.push("strftime('%Y', 'now') - strftime('%Y', dob) > 20");
        }
        if (/\bover 25\b/.test(message)) {
            conditions.push("strftime('%Y', 'now') - strftime('%Y', dob) > 25");
        }
        if (/\bover 30\b/.test(message)) {
            conditions.push("strftime('%Y', 'now') - strftime('%Y', dob) > 30");
        }
        if (/\bover 35\b/.test(message)) {
            conditions.push("strftime('%Y', 'now') - strftime('%Y', dob) > 35");
        }
        if (/\bover 40\b/.test(message)) {
            conditions.push("strftime('%Y', 'now') - strftime('%Y', dob) > 40");
        }
    }

    if (table === 'onboard_Documents') {
        // MIME Types
        if (message.includes('pdf documents')) conditions.push("mimetype = 'application/pdf'");
        if (message.includes('word documents')) conditions.push("mimetype = 'application/msword'");
        if (message.includes('images')) conditions.push("(mimetype = 'image/png' OR mimetype = 'image/jpeg')");

        if (message.includes('uploaded after april 2025')) {
            conditions.push("uploadedat >= '2025-04-01'");
        }

        if (message.includes('resume') || message.includes('cv')) {
            conditions.push("filename LIKE '%resume%' OR filename LIKE '%cv%'");
        }
    }

    if (table === 'onboard_RoleSuggestions') {
        // Keywords
        if (message.includes('sap') || message.includes('abap')) {
            conditions.push("keywords LIKE '%sap%' OR keywords LIKE '%abap%'");
        }
        if (message.includes('analytics')) {
            conditions.push("keywords LIKE '%analytics%'");
        }
        if (message.includes('cloud')) {
            conditions.push("keywords LIKE '%cloud%'");
        }

        // Role
        if (message.includes('developer roles')) {
            conditions.push("role LIKE '%developer%'");
        }
        if (message.includes('finance roles')) {
            conditions.push("role LIKE '%finance%'");
        }
    }

    if (conditions.length === 0) return null;
    return `WHERE ${conditions.join(' AND ')}`;
};
