const cds = require('@sap/cds');

module.exports = async function (srv) {
    const { Employees, Documents, RoleSuggestions } = srv.entities;

    // Automatically set defaults on Employee creation
    srv.before('CREATE', Employees, (req) => {
        req.data.createdAt = new Date();
        req.data.status = 'Pending';
    });

    // Evaluate suggested role based on uploaded resume
    srv.on('evaluateRole', async (req) => {
        const { employeeID } = req.data;
        const tx = cds.transaction(req);

        const [employee] = await tx.read(Employees).where({ ID: employeeID });
        if (!employee) return req.error(404, 'Employee not found');

        const docs = await tx.read(Documents).where({ employee_ID: employeeID });
        if (!docs.length) return 'No resume uploaded';

        const docText = Buffer.from(docs[0].content).toString('utf8').toLowerCase();
        const suggestions = await tx.run(SELECT.from(RoleSuggestions));

        const match = suggestions.find(s =>
            s.keywords.split(',').some(k => docText.includes(k.trim()))
        );

        const role = match ? match.role : 'General Associate';

        await tx.update(Employees).set({ role }).where({ ID: employeeID });
        return `Suggested Role: ${role}`;
    });

    // Trigger mock approval process
    srv.on('triggerApproval', async (req) => {
        const { employeeID } = req.data;
        const tx = cds.transaction(req);

        const [exists] = await tx.read(Employees).where({ ID: employeeID });
        if (!exists) return req.error(404, 'Employee not found');

        await tx.update(Employees).set({ status: 'Approved' }).where({ ID: employeeID });
        return 'Approval triggered (mocked)';
    });

    // Run raw SQL safely - limited to onboard_Employees only
    srv.on('runCustomSQL', async (req) => {
        const { query } = req.data;
        if (!query.toLowerCase().includes('select') || !query.toLowerCase().includes('onboard_employees')) {
            return req.error(400, 'Only SELECT queries allowed on onboard_Employees');
        }

        const db = await cds.connect.to('db');
        const result = await db.run(query);
        return result;
    });
};
