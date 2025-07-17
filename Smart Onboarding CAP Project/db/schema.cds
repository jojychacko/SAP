namespace onboard;

entity Employees {
  key ID         : UUID;
      name        : String(100);
      email       : String(100);
      role        : String(50);
      department  : String(50);
      status      : String(20); 
      joinDate    : Date;
      gender      : String(10);
      dob         : Date;
      createdAt   : Timestamp;
}

entity Documents {
  key ID          : UUID;
      employee_ID  : Association to Employees;
      filename     : String(255);
      mimetype     : String(50);
      content      : LargeBinary;
      uploadedAt   : Timestamp;
}

entity RoleSuggestions {
  key ID       : UUID;
      keywords  : String(100);
      role      : String(100);
}
