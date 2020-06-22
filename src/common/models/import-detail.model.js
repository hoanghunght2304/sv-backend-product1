import { Model, DataTypes } from 'sequelize';
import postgres from '../../config/postgres';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class ImportDetail extends Model { }

/**
 * Import Detail Schema
 */
ImportDetail.init(
    {
        /** attributes */
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        item_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        import_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        total_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_price: {
            type: DataTypes.DECIMAL,
            defaultValue: 0
        },

        /** management */
        created_by: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                id: null,
                name: null
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        }
    },
    {
        timestamps: false,
        sequelize: sequelize,
        modelName: 'import_detail',
        tableName: 'tbl_import_details'
    }
);

/**
 * Generate Table
 */
ImportDetail.sync({});

/**
 * @typedef ImportDetail
 */
export default ImportDetail;
