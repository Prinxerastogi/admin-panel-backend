const DlogTypes = {
    //job related
    job_accept: "job_accept",
    reached_pickup_point: "reached_pickup_point",
    job_picked: "job_picked",
    reached_customer: "reached_customer",
    job_complete: "job_complete",
    job_recovered: "job_recovered",
    job_cancelled: "job_cancelled",
    job_unassigned: "job_unassigned",
    // route related
    route_accepted: "route_accepted",
    route_rider_reached: "route_rider_reached",
    in_transit: "in_transit",
    route_completed: "route_completed",
    route_cancelled: "route_cancelled",

    // user activity related
    offline: "offline",
    returning: "returning",
    online: "online",
    auto_offline_from_online: "auto_offline_from_online",
    auto_offline_from_returning: "auto_offline_from_returning",
    flagged_location: "flagged_location",
    online_return: "online_return",
    returning_time_updated: "returning_time_updated",
};

const possibleTypes = Object.keys(DlogTypes);

module.exports = { DlogTypes, possibleTypes };
