/*
 AngularLovefield v1.0.0
 (c) 2016 ionutpetre.ro@gmail.com
 License: MIT
*/

(function() {

    angular
        .module('ngLovefield', [])

        .constant('LV_CONSTS', {
            'MSG_PREFIX': '[ngLovefield]: ',
            'TYPES': ['ARRAY_BUFFER', 'BOOLEAN', 'DATE_TIME', 'INTEGER', 'NUMBER', 'STRING', 'OBJECT'],
            'NAMING_PATTERN': /^[A-Za-z_][A-Za-z0-9_]*$/
        })

        .provider('$lovefield', ['LV_CONSTS', function(LV_CONSTS) {

            /* Configurable properties of the lovefield provider */
            var DB_NAME = null, DB_VERSION = null, DB_TABLES = null;

            /* Set methods accessible only in the config function */
            this.setDbName = function(dbName) {
                var err = dbNameError(dbName);
                (!err) ? DB_NAME = dbName : console.error(err);
            }

            this.setDbVersion = function(dbVersion) {
                var err = dbVersionError(dbVersion);
                (!err) ? DB_VERSION = dbVersion : console.error(err);
            }

            this.setDbTables = function(dbTables) {
                var err = dbTablesError(dbTables);
                (!err) ? DB_TABLES = dbTables : console.error(err);
            }

            this.addDbTable = function(dbTable) {
                DB_TABLES = DB_TABLES ? DB_TABLES : [];
                var err = dbTablesError(dbTables);
                (!err) ? DB_TABLES.push(dbTable) : console.error(err);
            }

            this.$get = ['$q', function($q) {

                /* Private Factory Constructor */
                function AngularLovefieldFactory() {

                    /* Private variables of the lovefied service */
                    var dbSchema = null, dbInstance = null;

                    /** Private methods of the lovefield service */
                    function createDbSchema() {
                        if (DB_NAME && DB_VERSION) {
                            dbSchema = lf.schema.create(DB_NAME, DB_VERSION);
                            console.info(LV_CONSTS.MSG_PREFIX + "db schema " + DB_NAME + " version " + DB_VERSION + " created successfully");
                        } else {
                            console.error(LV_CONSTS.MSG_PREFIX + "db name or db version were not specified");
                        }
                    }

                    function createDbTables() {
                        if (dbSchema && DB_TABLES) {
                            DB_TABLES.forEach(function(dbTable) {
                                var lfDbTable = dbSchema.createTable(dbTable.name);
                                dbTable.columns.forEach(function(dbColumn) {
                                    lfDbTable.addColumn(dbColumn.name, lf.Type[dbColumn.type]);
                                });
                                lfDbTable.addPrimaryKey([dbTable.primaryKey]);
                                console.info(LV_CONSTS.MSG_PREFIX + "db table " + dbTable.name + " created successfully");
                            });
                        } else {
                            console.error(LV_CONSTS.MSG_PREFIX + "db schema or db tables were not created");
                        }
                    }

                    function openDbConnection() {
                        var deffered = $q.defer();
                        if (dbInstance == null) {
                            if (dbSchema == null) {
                                createDbSchema(); createDbTables();
                            }
                            dbSchema.connect().then(function(_dbInstance) {
                                dbInstance = _dbInstance;
                                deffered.resolve(dbInstance);
                            });
                        } else {
                            deffered.resolve(dbInstance);
                        }
                        return deffered.promise;
                    }

                    /** Public methods exposed by the lovefield service */
                    this.insertItem = function(tableName, item) {
                        var deferred = $q.defer();
                        if (tableName && item) {
                            openDbConnection().then(function(db) {
                                var table = db.getSchema().table(tableName);
                                var row = table.createRow(item);
                                db.insertOrReplace().into(table).values([row]).exec().then(function(insertedRow) {
                                    var successMessage = LV_CONSTS.MSG_PREFIX + "item inserted successfully into " + tableName;
                                    console.info(successMessage); deferred.resolve(insertedRow);
                                });
                            });
                        } else {
                            var errorMessage = LV_CONSTS.MSG_PREFIX + "table name or item were not specified";
                            console.error(errorMessage); deferred.reject(errorMessage);
                        }
                        return deferred.promise;
                    }

                    this.getAllItems = function(tableName) {
                        var deferred = $q.defer();
                        if (tableName) {
                            openDbConnection().then(function(db) {
                                var table = db.getSchema().table(tableName);
                                db.select().from(table).exec().then(function(items) {
                                    var successMessage = LV_CONSTS.MSG_PREFIX + "successfully get all items from " + tableName;
                                    console.info(successMessage); deferred.resolve(items);
                                });
                            });
                        } else {
                            var errorMessage = LV_CONSTS.MSG_PREFIX + "table name was not specified";
                            console.error(errorMessage); deferred.reject(errorMessage);
                        }
                        return deferred.promise;
                    }

                };

                return new AngularLovefieldFactory();
            }];

            /* Private helper methods of the lovefied provider */
            function isValidLfName(name) {
                return LV_CONSTS.NAMING_PATTERN.test(name);
            }

            function isIntNumber(number) {
                return /^-?[0-9]+$/.test(number);
            }

            /*  Private validation methods of the lovefied provider */
            function dbVersionError(dbVersion) {
                if (!angular.isNumber(dbVersion)) {
                    return LV_CONSTS.MSG_PREFIX + "db version must be a number";
                }
                if (!isIntNumber(dbVersion)) {
                    return LV_CONSTS.MSG_PREFIX + "db version must be an integer number";
                }
                if (dbVersion <= 0) {
                    return LV_CONSTS.MSG_PREFIX + "db version must be an integer greater than 0";
                }
                return null;
            }

            function dbNameError(dbName) {
                if (!angular.isString(dbName)) {
                    return LV_CONSTS.MSG_PREFIX + "db name must be a string";
                }
                if (!isValidLfName(dbName)) {
                    return LV_CONSTS.MSG_PREFIX + "db name must abide lf's naming rule";
                }
                return null;
            }

            function dbTableColumnError(dbColumn) {
                if (!angular.isObject(dbColumn)) {
                    return LV_CONSTS.MSG_PREFIX + "db table column def must be an object";
                }
                if (!dbColumn.name || !dbColumn.type) {
                    return LV_CONSTS.MSG_PREFIX + "db table column def must have name and type";
                }
                if (!angular.isString(dbColumn.name)) {
                    return LV_CONSTS.MSG_PREFIX + "db table column name def must be a string";
                }
                if (!isValidLfName(dbColumn.name)) {
                    return LV_CONSTS.MSG_PREFIX + "db table column name must abide lf's naming rule";
                }
                if (!angular.isString(dbColumn.type)) {
                    return LV_CONSTS.MSG_PREFIX + "db table column type def must be a string";
                }
                if ((LV_CONSTS.TYPES.indexOf(dbColumn.type) == -1)) {
                    return LV_CONSTS.MSG_PREFIX + "db table column type must be the same as lf's types";
                }
                return null;
            }

            function dbTableError(dbTable) {
                if (!angular.isObject(dbTable)) {
                    return LV_CONSTS.MSG_PREFIX + "db table def must be an object";
                }
                if (!dbTable.name || !dbTable.columns || !dbTable.primaryKey) {
                    return LV_CONSTS.MSG_PREFIX + "db table def must have name, columns, primaryKey";
                }
                if (!angular.isString(dbTable.name)) {
                    return LV_CONSTS.MSG_PREFIX + "db table def name must be a string";
                }
                if (!isValidLfName(dbTable.name)) {
                    return LV_CONSTS.MSG_PREFIX + "db table def name must abide lf's naming rule";
                }
                if (!angular.isArray(dbTable.columns)) {
                    return LV_CONSTS.MSG_PREFIX + "db table def columns must be an array of objects";
                }
                if (dbTable.columns && dbTable.columns.length) {
                    dbTable.columns.some(function(dbColumn) {
                        return (dbTableColumnError(dbColumn) != null);
                    });
                }
            }

            function dbTablesError(dbTables) {
                if (!angular.isArray(dbTables)) {
                    return LV_CONSTS.MSG_PREFIX + "db tables must be an array of objects";
                }
            }

        }]);

})();