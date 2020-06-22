import { Model, DataTypes } from 'sequelize';
import postgres from '../../config/postgres';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class ExportDetail extends Model { }

/**
 * Export Detail Schema
 */
ExportDetail.init(
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
        export_id: {
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
        modelName: 'export_detail',
        tableName: 'tbl_export_details'
    }
);

/**
 * Generate Table
 */
ExportDetail.sync({});

/**
 * @typedef ExportDetail
 */
export default ExportDetail;
