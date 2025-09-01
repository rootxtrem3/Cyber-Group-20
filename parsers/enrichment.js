const geoip = require('geoip-lite');

async function enrichWithGeoIP(event) {
  try {
    const geo = geoip.lookup(event.source_ip);
    
    if (geo) {
      event.geoip = {
        country: geo.country,
        country_code: geo.country,
        region: geo.region,
        city: geo.city,
        latitude: geo.ll[0],
        longitude: geo.ll[1],
        timezone: geo.timezone,
        asn: geo.asn || 'Unknown',
        org: geo.org || 'Unknown'
      };
    } else {
      event.geoip = {
        country: 'Unknown',
        country_code: 'XX',
        region: 'Unknown',
        city: 'Unknown',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
        asn: 'Unknown',
        org: 'Unknown'
      };
    }
    
    return event;
  } catch (error) {
    console.error('Error enriching with GeoIP:', error);
    return event;
  }
}

module.exports = {
  enrichWithGeoIP
};
