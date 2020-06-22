import mongoose from 'mongoose';

/**
 * Property of ItemSchema
 * @public
 */
const propertySchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            default: 0
        }
    },
    {
        _id: false,
        timestamps: false
    }
);

/**
 * Sub Schema For ItemSchema
 * @public
 */
const designSchema = new mongoose.Schema(
    {
        /** may đo */
        initials__text: { type: [propertySchema], default: undefined },
        jacket_style_combined: { type: [propertySchema], default: undefined },
        jacket_lapel_type: { type: [propertySchema], default: undefined },
        jacket_wide_lapel: { type: [propertySchema], default: undefined },
        jacket_chest_pocket: { type: [propertySchema], default: undefined },
        jacket_fit: { type: [propertySchema], default: undefined },
        jacket_pockets_type: { type: [propertySchema], default: undefined },
        jacket_sleeve_buttons: { type: [propertySchema], default: undefined },
        jacket_vent: { type: [propertySchema], default: undefined },
        jacket_length: { type: [propertySchema], default: undefined },
        jacket_finishing: { type: [propertySchema], default: undefined },

        pants_fit: { type: [propertySchema], default: undefined },
        pants_peg: { type: [propertySchema], default: undefined },
        pants_belt: { type: [propertySchema], default: undefined },
        pants_front_pocket: { type: [propertySchema], default: undefined },
        pants_back_pocket_combine: { type: [propertySchema], default: undefined },
        pants_cuff: { type: [propertySchema], default: undefined },
        pants_length: { type: [propertySchema], default: undefined },
        pants_rise: { type: [propertySchema], default: undefined },
        pants_belt_loops: { type: [propertySchema], default: undefined },
        pants_waistband: { type: [propertySchema], default: undefined },
        pants_back_pocket_style: { type: [propertySchema], default: undefined },

        waistcoat_piece: { type: [propertySchema], default: undefined },
        waistcoat_style_combined: { type: [propertySchema], default: undefined },
        waistcoat_lapel: { type: [propertySchema], default: undefined },
        waistcoat_lapel_width: { type: [propertySchema], default: undefined },
        waistcoat_bottom: { type: [propertySchema], default: undefined },
        waistcoat_chest_pocket: { type: [propertySchema], default: undefined },
        waistcoat_pockets: { type: [propertySchema], default: undefined },

        shirt_neck: { type: [propertySchema], default: undefined },
        shirt_neck_buttons: { type: [propertySchema], default: undefined },
        shirt_cuffs: { type: [propertySchema], default: undefined },
        shirt_neck_no_interfacing: { type: [propertySchema], default: undefined },
        shirt_fit: { type: [propertySchema], default: undefined },
        shirt_sleeve: { type: [propertySchema], default: undefined },
        shirt_chest_pocket_type: { type: [propertySchema], default: undefined },
        shirt_pleats: { type: [propertySchema], default: undefined },
        shirt_chiet: { type: [propertySchema], default: undefined },
        shirt_cut: { type: [propertySchema], default: undefined },
        shirt_sleeve_details: { type: [propertySchema], default: undefined },
        shirt_chest_pocket: { type: [propertySchema], default: undefined },
        shirt_epaulettes: { type: [propertySchema], default: undefined },

        coat_model: { type: [propertySchema], default: undefined },
        coat_fastening: { type: [propertySchema], default: undefined },
        coat_lapel_length: { type: [propertySchema], default: undefined },
        coat_lapel_style: { type: [propertySchema], default: undefined },
        coat_lapel_wide: { type: [propertySchema], default: undefined },
        coat_length: { type: [propertySchema], default: undefined },
        coat_fit: { type: [propertySchema], default: undefined },
        coat_chest_pocket: { type: [propertySchema], default: undefined },
        coat_pockets_type: { type: [propertySchema], default: undefined },
        coat_welted: { type: [propertySchema], default: undefined },
        coat_belt: { type: [propertySchema], default: undefined },
        coat_sleeve: { type: [propertySchema], default: undefined },
        coat_backcut: { type: [propertySchema], default: undefined },
        coat_epaulettes: { type: [propertySchema], default: undefined },
        coat_gunflaps: { type: [propertySchema], default: undefined },
        coat_buttons: { type: [propertySchema], default: undefined },

        zip_lenght: { type: [propertySchema], default: undefined },
        zip_cut: { type: [propertySchema], default: undefined },
        zip_rise: { type: [propertySchema], default: undefined },
        zip_belt: { type: [propertySchema], default: undefined },
        zip_belt_loops: { type: [propertySchema], default: undefined },
        zip_waistband: { type: [propertySchema], default: undefined },
        zip_front_pocket: { type: [propertySchema], default: undefined },
        zip_back_pocket: { type: [propertySchema], default: undefined },
        zip_back_pocket_type: { type: [propertySchema], default: undefined },

        skirt_lenght: { type: [propertySchema], default: undefined },
        skirt_rise: { type: [propertySchema], default: undefined },
        skirt_belt: { type: [propertySchema], default: undefined },
        skirt_belt_loops: { type: [propertySchema], default: undefined },
        skirt_waistband: { type: [propertySchema], default: undefined },

        dress_top_style: { type: [propertySchema], default: undefined },
        dress_necklines: { type: [propertySchema], default: undefined },
        dress_sleeves: { type: [propertySchema], default: undefined },
        dress_bottom_style: { type: [propertySchema], default: undefined },
        dress_length: { type: [propertySchema], default: undefined },
        dress_vents: { type: [propertySchema], default: undefined },
        dress_pockets: { type: [propertySchema], default: undefined },

        /** bảo hành sửa chữa */
        dinh_cuc_quan: { type: [propertySchema], default: undefined },
        vat_gau: { type: [propertySchema], default: undefined },
        cat_ngan_quan: { type: [propertySchema], default: undefined },
        them_dai_quan: { type: [propertySchema], default: undefined },
        buc_chi_quan: { type: [propertySchema], default: undefined },
        thay_moc_quan: { type: [propertySchema], default: undefined },
        noi_bung: { type: [propertySchema], default: undefined },
        noi_mong: { type: [propertySchema], default: undefined },
        bop_bung: { type: [propertySchema], default: undefined },
        bop_mong: { type: [propertySchema], default: undefined },
        noi_dui: { type: [propertySchema], default: undefined },
        noi_day: { type: [propertySchema], default: undefined },
        bop_dui: { type: [propertySchema], default: undefined },
        bop_day: { type: [propertySchema], default: undefined },
        noi_ong: { type: [propertySchema], default: undefined },
        noi_goi: { type: [propertySchema], default: undefined },
        bop_ong: { type: [propertySchema], default: undefined },
        bop_goi: { type: [propertySchema], default: undefined },
        thay_khoa_quan: { type: [propertySchema], default: undefined },
        noi_suon_quan: { type: [propertySchema], default: undefined },
        bop_suon_quan: { type: [propertySchema], default: undefined },
        chinh_sua_form_quan: { type: [propertySchema], default: undefined },
        dinh_cuc_ao_somi: { type: [propertySchema], default: undefined },
        buc_chi_ao_somi: { type: [propertySchema], default: undefined },
        cat_ngan_tay_ao_somi: { type: [propertySchema], default: undefined },
        cat_ngan_dai_ao_somi: { type: [propertySchema], default: undefined },
        noi_suon_tay_ao_somi: { type: [propertySchema], default: undefined },
        bop_suon_tay_ao_somi: { type: [propertySchema], default: undefined },
        noi_suon_ao_somi: { type: [propertySchema], default: undefined },
        bop_suon_ao_somi: { type: [propertySchema], default: undefined },
        sua_vai_ao: { type: [propertySchema], default: undefined },
        chinh_sua_form_ao: { type: [propertySchema], default: undefined },
        dinh_cuc_ao_vest: { type: [propertySchema], default: undefined },
        buc_chi_ao_vest: { type: [propertySchema], default: undefined },
        cat_ngan_dai_ao_vest: { type: [propertySchema], default: undefined },
        tang_chieu_dai_ao_vest: { type: [propertySchema], default: undefined },
        cat_ngan_tay_ao_vest: { type: [propertySchema], default: undefined },
        tang_chieu_dai_tay_ao_vest: { type: [propertySchema], default: undefined },
        noi_suon_tay_ao_vest: { type: [propertySchema], default: undefined },
        bop_suon_tay_ao_vest: { type: [propertySchema], default: undefined },
        noi_suon_ao_vest: { type: [propertySchema], default: undefined },
        bop_suon_ao_vest: { type: [propertySchema], default: undefined },
        noi_rong_vai: { type: [propertySchema], default: undefined },
        bop_rong_vai: { type: [propertySchema], default: undefined },
        tra_lai_tay: { type: [propertySchema], default: undefined },
        thay_doi_form_ao: { type: [propertySchema], default: undefined },

        /** mở rộng */
        jacket_lapel_satin__contrast: { type: [propertySchema], default: undefined },
        lining__contrast: { type: [propertySchema], default: undefined },
        handkerchief__contrast: { type: [propertySchema], default: undefined },
        metal_buttons__contrast: { type: [propertySchema], default: undefined },
        neck_lining__contrast: { type: [propertySchema], default: undefined },
        neck_fabric__contrast: { type: [propertySchema], default: undefined },
        cuffs_fabric__contrast: { type: [propertySchema], default: undefined },
        chest_pleats: { type: [propertySchema], default: undefined },

        jacket_lapel_satin__color: { type: [propertySchema], default: undefined },
        lining__color: { type: [propertySchema], default: undefined },
        handkerchief__color: { type: [propertySchema], default: undefined },
        metal_buttons__color: { type: [propertySchema], default: undefined },
        neck_lining__color: { type: [propertySchema], default: undefined },
        initials__color: { type: [propertySchema], default: undefined },
        neck_fabric__color: { type: [propertySchema], default: undefined },
        cuffs_fabric__color: { type: [propertySchema], default: undefined },
        chest_pleats__color: { type: [propertySchema], default: undefined },

        laundry_suits: { type: [propertySchema], default: undefined },
        quick_tailor_vest: { type: [propertySchema], default: undefined },
        laundry_vest: { type: [propertySchema], default: undefined },
        theu_dot_ve_ao: { type: [propertySchema], default: undefined },
        theu_dot_ve_tui: { type: [propertySchema], default: undefined },
        quick_tailor_pants: { type: [propertySchema], default: undefined },
        laundry_pants: { type: [propertySchema], default: undefined },
        theu_dot_cap_quan: { type: [propertySchema], default: undefined },
        tailor_pants_layer: { type: [propertySchema], default: undefined },
        quick_tailor_zip: { type: [propertySchema], default: undefined },
        quick_tailor_skirt: { type: [propertySchema], default: undefined },
        quick_tailor_dresses: { type: [propertySchema], default: undefined },
        quick_tailor_shirt: { type: [propertySchema], default: undefined },
        laundry_shirt: { type: [propertySchema], default: undefined },
        theu_dot_co_tay: { type: [propertySchema], default: undefined },
        theu_dot_co_tay_nep: { type: [propertySchema], default: undefined },
        quick_tailor_gile: { type: [propertySchema], default: undefined },
        quick_tailor_cloak: { type: [propertySchema], default: undefined }
    },
    {
        _id: false,
        timestamps: false
    }
);

module.exports = designSchema;
