import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
	ConfigModule,
	ConfigService,
	environment,
	getConfig,
	setConfig
} from '@everbyte/config';
import { Logger, Type } from '@nestjs/common';
import { join } from 'path';
import { coreEntities } from './database/entities';
import { coreSubscribers } from './database/subscribers';
import { EntitySchema, EntitySubscriberInterface } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
export async function bootstrap() {
	await updateConfigs();
	const app = await NestFactory.create(AppModule);
	const configs = app.select(ConfigModule).get(ConfigService);

	console.log('[configs]', configs.dataSourceOptions);

	const environment = configs.isProd ? 'Production' : 'Development';
	const dataSourceOptions = {
		...configs.dataSourceOptions
	} as unknown as PostgresConnectionOptions;
	await app.listen(configs.port, () => {
		Logger.log(' ');
		Logger.log('Listening at  http://localhost:' + configs.port);
		Logger.log(`Environment     : ${environment}`);
		Logger.log(' ');
		Logger.log(`Postgres Host   : ${dataSourceOptions.host}`);
		Logger.log(`Postgres Port   : ${dataSourceOptions.port}`);
		Logger.log(`Postgres DbName : ${dataSourceOptions.database}`);
		Logger.log(' ');
		Logger.log(
			`Redis Host : ${configs.redisOptions.host}:${configs.redisOptions.port}`
		);
		Logger.log(`Running in ${environment} mode`);
	});
	return app;
}

/**
 * Updating global configs.
 */
export async function updateConfigs() {
	/**
	 * add migrations directory and cli paths to the datasource config
	 */

	setConfig({
		dataSourceOptions: {
			...getMigrationsPaths(),
			migrationsTransactionMode: 'each', // Run migrations automatically in each transaction. i.e."all" | "none" | "each"
			migrationsRun: !environment.production, // Run migrations automatically, you can disable this if you prefer running migration manually.
			entities: coreEntities as unknown as Array<Type<EntitySchema>>,
			subscribers: coreSubscribers as Array<
				Type<EntitySubscriberInterface>
			>
		}
	});
	return getConfig();
}

/**
 * get migrations directory and cli paths
 */
export function getMigrationsPaths() {
	console.log('[Current Directory __dirname]', __dirname);
	console.log('[Current directory process.cwd()]:', process.cwd());

	return {
		migrations: [
			join(__dirname, '/database/migrations/migrations/*{.ts,.js}')
		],
		cli: {
			migrationsDir: join(
				__dirname,
				'../src/database/migrations/migrations'
			)
		}
	};
	// return {
	// 	migrations: [
	// 		join(
	// 			process.cwd(),
	// 			'/packages/core/src/database/migrations/migrations/*{.ts,.js}}'
	// 		)
	// 	],
	// 	cli: {
	// 		migrationsDir: join(
	// 			process.cwd(),
	// 			'/packages/core/src/database/migrations/migrations'
	// 		)
	// 	}
	// };
}
