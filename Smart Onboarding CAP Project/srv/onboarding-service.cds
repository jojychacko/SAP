using onboard from '../db/schema';

service OnboardingService {
  entity Employees as projection on onboard.Employees;
  entity Documents as projection on onboard.Documents;
  entity RoleSuggestions as projection on onboard.RoleSuggestions;

  action evaluateRole(employeeID: UUID) returns String;
  action triggerApproval(employeeID: UUID) returns String;
}
