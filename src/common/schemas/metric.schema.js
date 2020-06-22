import mongoose from 'mongoose';

/**
 * Sub Schema For Body Note In Metric Schema
 * @public
 */
const bodySchema = new mongoose.Schema(
    {
        weight: {
            type: Number,
            default: 0
        },
        height: {
            type: Number,
            default: 0
        },
        images: {
            type: Array
        },
        outside: {
            type: [
                new mongoose.Schema(
                    {
                        _id: false,
                        name: {
                            type: String,
                            required: true,
                        },
                        values: {
                            type: Array,
                            default: []
                        }
                    },
                    {
                        _id: false,
                        timestamps: false,
                        versionKey: false
                    }
                )
            ]
        }
    },
    {
        _id: false,
        timestamps: false,
        versionKey: false
    }
);

/**
 * Sub Schema For OrderSchema
 * @public
 */
const metricSchema = new mongoose.Schema(
    {
        /** metrics may đo */
        rong_vai: {
            type: { type: Number }
        },
        dai_ao_sau_somi: {
            type: { type: Number }
        },
        dai_ao_sau_vest: {
            type: { type: Number }
        },
        ha_eo_sau: {
            type: { type: Number }
        },
        dai_tay_ao_somi_dai: {
            type: { type: Number }
        },
        cua_tay_ao_somi_dai: {
            type: { type: Number }
        },
        dai_tay_ao_somi_ngan: {
            type: { type: Number }
        },
        cua_tay_ao_somi_ngan: {
            type: { type: Number }
        },
        dai_tay_ao_vest: {
            type: { type: Number }
        },
        cua_tay_ao_vest: {
            type: { type: Number }
        },
        dai_tay_ao_mangto: {
            type: { type: Number }
        },
        cua_tay_ao_mangto: {
            type: { type: Number }
        },
        bap_tay: {
            type: { type: Number }
        },
        khuu_tay: {
            type: { type: Number }
        },
        vong_nach: {
            type: { type: Number }
        },
        dai_ao_truoc_vest: {
            type: { type: Number }
        },
        dai_ao_truoc_somi: {
            type: { type: Number }
        },
        dai_ao_truoc_ghile: {
            type: { type: Number }
        },
        dai_ao_truoc_mang_to: {
            type: { type: Number }
        },
        ha_cuc: {
            type: { type: Number }
        },
        ha_dinh_nguc: {
            type: { type: Number }
        },
        ha_chan_nguc: {
            type: { type: Number }
        },
        cach_nguc: {
            type: { type: Number }
        },
        vong_co_ao_somi: {
            type: { type: Number }
        },
        vong_co_ao_vest: {
            type: { type: Number }
        },
        vong_co_ao_ghile: {
            type: { type: Number }
        },
        vong_co_ao_mangto: {
            type: { type: Number }
        },
        vong_nguc: {
            type: { type: Number }
        },
        vong_eo: {
            type: { type: Number }
        },
        vong_bung_ao: {
            type: { type: Number }
        },
        vong_mong_ao: {
            type: { type: Number }
        },
        vong_bung_quan: {
            type: { type: Number }
        },
        vong_mong_quan: {
            type: { type: Number }
        },
        dai_quan: {
            type: { type: Number }
        },
        vong_ong: {
            type: { type: Number }
        },
        len_goi: {
            type: { type: Number }
        },
        vong_goi: {
            type: { type: Number }
        },
        vong_dui: {
            type: { type: Number }
        },
        vong_day: {
            type: { type: Number }
        },

        /** metrics thử đồ */
        vong_co_sau: {
            type: { type: Number }
        },
        song_lung_co: {
            type: { type: Number }
        },
        xuoi_vai_tay_tt: {
            type: { type: Number }
        },
        xuoi_vai_tay_ts: {
            type: { type: Number }
        },
        xuoi_vai_co_tt: {
            type: { type: Number }
        },
        xuoi_vai_co_ts: {
            type: { type: Number }
        },
        song_lung_ngang_nguc: {
            type: { type: Number }
        },
        song_lung_ngang_eo: {
            type: { type: Number }
        },
        do_day_ken_vai: {
            type: { type: Number }
        },
        do_rong_ve_ao: {
            type: { type: Number }
        },
        vuot_cap_truoc: {
            type: { type: Number }
        },
        dong_cap_than_sau: {
            type: { type: Number }
        },
        suon_quan: {
            type: { type: Number }
        },
        lot_tui: {
            type: { type: Number }
        },
        dang_quan: {
            type: { type: Number }
        },

        /** body notes */
        body: {
            type: bodySchema,
            default: bodySchema
        }
    },
    {
        _id: false,
        timestamps: false
    }
);

module.exports = metricSchema;
