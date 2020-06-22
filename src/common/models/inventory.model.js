import { Model, DataTypes } from 'sequelize';
import postgres from '../../config/postgres';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Inventory extends Model { }

/**
 * Inventory Schema
 */
Inventory.init(
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
        store_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        total_quantity: {
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
        modelName: 'inventory',
        tableName: 'tbl_inventories'
    }
);

/**
 * Generate Table
 */
Inventory.sync({});

/**
 * @typedef Inventory
 */
export default Inventory;
