/*
 * LightningChart JS that showcases MapChart with dynamic region coloring
 * based on an external data set (country population).
 */
// Import LightningChartJS
const lcjs = require('@arction/lcjs')

// Extract required parts from LightningChartJS.
const { lightningChart, MapTypes, PalettedFill, LUT, ColorRGBA, formatLongitudeLatitude, regularColorSteps, Themes } = lcjs

const mapChart = lightningChart().Map({
    // theme: Themes.darkGold
    type: MapTypes.Europe,
})
const theme = mapChart.getTheme()

mapChart
    .setTitle('Population by country (2018)')
    .setFillStyle(
        new PalettedFill({
            lut: new LUT({
                steps: regularColorSteps(5 * 1000 * 1000, 100 * 1000 * 1000, theme.examples.badGoodColorPalette.reverse(), {
                    formatLabels: (value) => `${(value / (1000 * 1000)).toFixed(0)} Million`,
                }),
                interpolate: true,
                // This property is used to specify fallback color for regions which have no data.
                color: ColorRGBA(255, 255, 255),
            }),
        }),
    )
    .setCursorResultTableFormatter((builder, region, value, longitude, latitude) => {
        builder.addRow(region.name).addRow(formatLongitudeLatitude(longitude, latitude))
        if (value) {
            builder.addRow(`Population: `, '', `${(value / (1000 * 1000)).toFixed(1)} million`)
        } else {
            builder.addRow(`No population data available`)
        }
        return builder
    })

// Add Legend to show color look-up range.
mapChart
    .addLegendBox()
    // Dispose example UI elements automatically if they take too much space. This is to avoid bad UI on mobile / etc. devices.
    .setAutoDispose({
        type: 'max-width',
        maxWidth: 0.3,
    })
    .add(mapChart)

// Load population data.
fetch(document.head.baseURI + 'examples/assets/1101/population_eu_2018.json')
    .then((r) => r.json())
    .then((populationData) => {
        // Data is Europe countries population in year 2018.
        // Format is:
        // Array<{ "Country Code": string, "Value": number }>

        // Map data to format expected by Europe MapChart.
        const regionValuesData = populationData.map((item) => ({
            ISO_A3: item['Country Code'],
            value: item['Value'],
        }))
        mapChart.invalidateRegionValues(regionValuesData)
    })
