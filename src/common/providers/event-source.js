import modelEvent from '../services/events/model-event';

export default {
    register: () => {
        modelEvent.registerAppEvent();

        modelEvent.registerProductEvent();

        modelEvent.registerOrderEvent();
        modelEvent.registerDeliveryEvent();

        modelEvent.registerExportEvent();
        modelEvent.registerImportEvent();
        modelEvent.registerStockTakeEvent();
    }
};
