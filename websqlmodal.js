var WebSql = new function () {
    var instance = this;

    var webSqlInstance = function (database) {
        var sqlConfig = this;

        var methods = function (tableName) {
            this.Insert = function (columns, data, callback) {
                database.transaction(function (t) {
                    t.executeSql('INSERT INTO ' + tableName + ' (' + columns + ') VALUES (' + data + ')');
                    callback ? callback() : null;
                });
            }

            this.GetAll = function (callback) {
                database.transaction(function (t) {
                    t.executeSql('select * from ' + tableName, [], function (tx, result) {
                        callback(result);
                    })
                });
            }

            this.Where = function (column, operator, data, callback) {
                var generateCommand = function () {
                    return column + ' ' + operator + data;
                }
                database.transaction(function (t) {

                    t.executeSql('select * from ' + tableName + ' where ' + generateCommand(), [], function (tx, result) {
                        callback(result);
                    })
                });
            }

            this.CustomWhere = function (command, callback) {
                database.transaction(function (t) {
                    t.executeSql('select * from ' + tableName + ' where ' + command, [],
                        function (tx, result) {
                            callback(result);
                        },
                        function (transaction, error) {
                            console.log(error);
                        }
                    )
                });
            }
        }

        this.CreateTable = function (tableName, tableColumnNames, callback) {
            try {
                database.transaction(function (tx) {
                    tx.executeSql('DROP TABLE IF EXISTS ' + tableName, [],
                        function () {
                            tx.executeSql("CREATE TABLE IF NOT EXISTS " + tableName + " (" + tableColumnNames + ")", [],
                                function (transaction, success) {
                                    sqlConfig[tableName] = new methods(tableName);
                                    callback ? callback() : null;
                                },
                                function (transaction, error) {
                                    console.log(error);
                                }
                            );
                        },
                        function (transaction, error) {
                            console.log(error);
                        }
                    );
                });

            } catch (e) {
                console.log(e);
            }
        }
    }

    this.CreateDatabase = function (name) {
        try {
            return new webSqlInstance(openDatabase(name, '1.0', 'Created From GibimSonik', 0.5 * 1024 * 1024));
        } catch (e) {
            console.log(e);
        }
    }
}