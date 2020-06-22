import { Model, DataTypes } from 'sequelize';
import postgres from '../../config/postgres';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class StockDetail extends Model { }

/**
 * Stock Detail Schema
 */
StockDetail.init(
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
        stock_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        total_actual: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        total_adjustment: {
            type: DataTypes.INTEGER,
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
        modelName: 'stock_detail',
        tableName: 'tbl_stock_details'
    }
);

/**
 * Generate Table
 */
StockDetail.sync({});

/**
 * @typedef StockDetail
 */
export default StockDetail;
