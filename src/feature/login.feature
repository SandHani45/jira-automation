Feature: User login functionality

  Scenario: Successful login with valid credentials
    Given the user navigates to the login page
    When the user enters a valid username and password
    Then the user should be redirected to the dashboard

  Scenario: Unsuccessful login with invalid credentials
    Given the user navigates to the login page
    When the user enters an invalid username or password
    Then an error message should be displayed