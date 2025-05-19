type DatabaseConfiguration = PostgresConfiguration;

interface PostgresConfiguration {
    connectionString: string;
    ssl: {
        rejectUnauthorized: boolean;
    };
};

export {
    DatabaseConfiguration,
    PostgresConfiguration
};