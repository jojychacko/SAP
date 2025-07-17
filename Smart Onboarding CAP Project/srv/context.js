module.exports = {
    onboard_Employees: {
        columns: ['id', 'name', 'email', 'role', 'department', 'status', 'joindate', 'gender', 'dob', 'createdat'],
        uniqueValues: {
            department: ['HR', 'IT', 'Finance', 'Sales'],
            status: ['Approved', 'Pending', 'Rejected'],
            gender: ['Male', 'Female']
        }
    },
    onboard_Documents: {
        columns: ['id', 'employee_id', 'filename', 'mimetype', 'content', 'uploadedat'],
        uniqueValues: {}
    },
    onboard_RoleSuggestions: {
        columns: ['id', 'keywords', 'role'],
        uniqueValues: {}
    }
};
