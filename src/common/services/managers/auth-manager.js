/**
 * Get permission by staffId
 *
 * @public
 * @param {*} staffId
 */
const getPermissionsFromStaffId = async (staffId) => {
    try {
        // TODO: caching

        // const permissions = await managerAdapter.getStaffPermissions(staffId);
        console.log(staffId);
        return ['administrator'];
    } catch (error) {
        return [];
    }
};

module.exports = {
    getPermissionsFromStaffId
};
