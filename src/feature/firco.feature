Feature: Firco User functionality

  Scenario: Successful Firco with valid credentials
    Given the user navigates to the Firco page
    When the user enters a valid username and password
    Then the user should be redirected to the dashboard

  Scenario: Unsuccessful Firco with invalid credentials
    Given the user navigates to the Firco page
    When the user enters an invalid username or password
    Then an error message should be displayed