Feature: test if cucumber works

  Scenario: I run steps that do not exist yet
      Given I open the login page
      When I login with admin
      And authorize glowingbear-js
      Then I am at the workspace page
