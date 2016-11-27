# angular-lovefield
Angular module upon Google's Lovefield relational database designated for web apps


In order to set up the ngLovefield module, you need to follow these steps:
  - Inject ngLovefield module into your angular application module:
  
  ```sh
  angular.module('ngLovefieldDemo', ['ngLovefield'])
  ```
  
  - Inject $lovefieldProvider into your config function
  
  ```sh
  .config(['$lovefieldProvider', function($lovefieldProvider) {}])
  ```
  
  - Set up the database name, version and tables 
  
  ```sh
  $lovefieldProvider.setDbName('myDb');
  $lovefieldProvider.setDbVersion(1);

  $lovefieldProvider.setDbTables([
    {
      name: 'myTable',
      columns: [
        { name: 'id', type: 'INTEGER' },
        { name: 'text', type: 'STRING' }
      ],
      primaryKey: 'id'
    }
  ]);
  ```

For more examples of using ngLovefield module, look at the demo directory.
