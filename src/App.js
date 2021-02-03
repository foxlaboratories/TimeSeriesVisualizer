import React, { useState, useLayoutEffect  } from 'react';
import './App.css';
import useEventListener from '@use-it/event-listener'
import { ResponsiveChoropleth } from "@nivo/geo";
import Grid from "@material-ui/core/Grid";
import countries from "./components/countries";
import data from "./components/data";
import useWindowDimensions from './components/windowDimensions';
import { useSwipeable } from 'react-swipeable';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import FastRewindIcon from '@material-ui/icons/FastRewind';
import FastForwardIcon from '@material-ui/icons/FastForward';
import IconButton from '@material-ui/core/IconButton';
import InfoDialog from './components/InfoDialog';
import 'fontsource-roboto';

const CASES_PERCENTAGE_YEARWEEK = 0;
const CASES_YEARWEEK = 1;
const CASES_CUMULATIVE = 2;
const MORTALITY_YEARWEEK = 3;

const App = () => {

    const [state, setState] = useState({
        year: 2020,
        week: 1,
        maxDeaths: 0,
        maxCases: 0,
        maxNotifications: 0,
        yearWeekMaxDeaths: 0,
        yearWeekMaxCases: 0,
        yearWeekMaxNotifications: 0,
        yearWeekMaxMortality: 0,
        yearWeekMaxPercentageDeaths: 0,
        yearWeekMaxPercentageCases: 0,
        deaths: [],
        cases: [],
        notification: [],
        yearWeekDeaths: [],
        yearWeekCases: [],
        yearWeekNotifications: [],
        yearWeekMortality: [],
        percentageDeaths: [],
        percentageCases: [],
        
    });
    
    const useStyles = makeStyles(theme => ({
        offset: theme.mixins.toolbar,
        appBar: {
            background: "rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur( 4px)"
        },
        chart:
        {
            borderBottom: "none",
            background: "#fff",
            borderRadius: "2px",
            boxShadow: "0 0 2px 0 rgba(0,0,0,0.1), 0 2px 2px 0 rgba(0,0,0,0.25)"

        },
        container:
        {

        }
    }))
    const classes = useStyles();


    const isTabletOrMobile = useMediaQuery("(max-width: 1224px)")
    const isPortrait = useMediaQuery("(orientation: portrait)")
    const { height, width } = useWindowDimensions();    
    const calculateStyle = () => {
        if (isTabletOrMobile) {

            return { width: width + "px", height: (isPortrait ? ((height - 50) / 2) : (height - 80)) + "px" }

        } else {
            return { width: ((width - 200) / 2) + "px", height: ((height - 200) / 2) + "px" }

        }
    }

    const onForward = () => { adjustTimeScale(1); }
    const onRewind = () => { adjustTimeScale(-1); }

    const { ref } = useSwipeable({ onSwipedLeft: () => adjustTimeScale(1), onSwipedRight: () => adjustTimeScale(-1) });
    const keyHandler = ({ key }) => {
        if (key === "ArrowLeft" || key === "ArrowRight") {
            const direction = (key === "ArrowLeft" ? -1 : 1);
            adjustTimeScale(direction);
        }
    }
    useEventListener('keydown', keyHandler);

    const getMaxYearWeek = (data, indicator, prop, year, week) => {

        const filtered = data.filter(item => item.country_code && item.indicator === indicator && item.year_week === (year + "-" + String(week).padStart(2, '0')) && item[prop] > 0)
            .map(item => ({
                id: item.country_code,
                value: item[prop]
            }));
        return getArrayMax(filtered, "value");

    }

    const getMax = (data, indicator, prop, year,) => {

        const filtered = data.filter(item => item.country_code && item.indicator === indicator &&  item.year_week.startsWith("2020") && item[prop] > 0)
            .map(item => ({
                id: item.country_code,
                value: item[prop]
            }));
        return getArrayMax(filtered, "value");

    }

    const generateData = (data, indicator, prop, year, week) => {

        return data.filter(item => item.country_code && (item.indicator === indicator && item.year_week === (year + "-" + String(week).padStart(2, '0')) && item[prop] > 0))
            .map(item => ({
                id: item.country_code,
                value: item[prop],
                population: item.population
            }));
    }

    const matchArray = (data, comparison) => {
        let matchedArray = data.map((item, index) => {
            let matches = comparison.find(itm => itm.id === item.id);

            return {
                id: item.id,
                value: ((matches ? matches.value : 0) * 100) / item.value
            }
        })
        return matchedArray;
    }

    const adjustTimeScale = (direction) => {
        
        var week = state.week + direction;

        if (week >= 1 && week <= 53) {

            
            let deaths = generateData(data, "deaths", "cumulative_count", state.year, state.week);
            let percentageDeaths = deaths.map((item, index) => {
                return { id: item.id, value: (item.value * 100)/item.population}
            })
            let yearWeekDeaths = generateData(data, "deaths", "weekly_count", state.year, state.week);
            let cases = generateData(data, "cases", "cumulative_count", state.year, state.week);
            let percentageCases = cases.map((item, index) => {
                return { id: item.id, value: (item.value * 100) / item.population }
            })
            let yearWeekCases = generateData(data, "cases", "weekly_count", state.year, state.week);

            let notifications = generateData(data, "cases", "rate_14_day", state.year, state.week);
            let yearWeekNotifications = generateData(data, "cases", "rate_14_day", state.year, state.week);

            let yearWeekMortality = matchArray(yearWeekCases, yearWeekDeaths);

            const maxDeaths = getMaxYearWeek(data, "deaths", "weekly_count", state.year, week);
            const maxCases = getMaxYearWeek(data, "cases", "weekly_count", state.year, week);
            const maxNotifications = getMaxYearWeek(data, "cases", "rate_14_day", state.year, week);
            const maxPercentageDeaths = getArrayMax(percentageDeaths, "value");
            const maxPercentageCases = getArrayMax(percentageCases, "value");
            const maxMortality = getArrayMax(yearWeekMortality, "value");


            setState({
                ...state,
                deaths: deaths,
                cases: cases,
                notifications: notifications,
                yearWeekDeaths: yearWeekDeaths,
                yearWeekCases: yearWeekCases,
                yearWeekNotifications: yearWeekNotifications,
                yearWeekMortality: yearWeekMortality,
                percentageDeaths: percentageDeaths,
                percentageCases: percentageCases,
                week: week,
                yearWeekMaxDeaths: maxDeaths,
                yearWeekMaxCases: maxCases,
                yearWeekMaxNotifications: maxNotifications,
                yearWeekMaxMortality: maxMortality,
                yearWeekMaxPercentageDeaths: maxPercentageDeaths,
                yearWeekMaxPercentageCases: maxPercentageCases

            });
        }

        

    }

    const getArrayMax = (array, prop) => {
        return array.reduce(function (max, x) { return (parseFloat(x[prop]) > parseFloat(max)) ? parseFloat(x[prop]) : parseFloat(max); }, Number.NEGATIVE_INFINITY);
    }

    
    useLayoutEffect(() => {
        ref(document);


        let deaths = generateData(data, "deaths", "cumulative_count", state.year, state.week);
        let percentageDeaths = deaths.map((item, index) => {
            return { id: item.id, value: (item.value * 100) / item.population }
        })
        let yearWeekDeaths = generateData(data, "deaths", "weekly_count", state.year, state.week);
        let cases = generateData(data, "cases", "cumulative_count", state.year, state.week);
        let percentageCases = cases.map((item, index) => {
            return { id: item.id, value: (item.value * 100) / item.population }
        })
        let yearWeekCases = generateData(data, "cases", "weekly_count", state.year, state.week);
        let notifications = generateData(data, "cases", "rate_14_day", state.year, state.week);
        let yearWeekNotifications = generateData(data, "cases", "rate_14_day", state.year, state.week);
        let yearWeekMortality = matchArray(yearWeekCases, yearWeekDeaths);

        const maxDeaths = getMax(data, "deaths", "cumulative_count", state.year);
        const maxCases = getMax(data, "cases", "cumulative_count", state.year);
        const maxNotifications = getMax(data, "cases", "rate_14_day", state.year);
        const maxYearWeekDeaths = getMaxYearWeek(data, "deaths", "weekly_count", state.year, state.week);
        const maxYearWeekCases = getMaxYearWeek(data, "cases", "weekly_count", state.year, state.week);
        const maxYearWeekNotifications = getMaxYearWeek(data, "cases", "rate_14_day", state.year, state.week);
        const maxPercentageDeaths = getArrayMax(percentageDeaths, "value");
        const maxPercentageCases = getArrayMax(percentageCases, "value");
        const maxYearWeekMortality = getArrayMax(yearWeekMortality, "value");


        setState({
            ...state,
            deaths: deaths,
            cases: cases,
            notifications: notifications,
            yearWeekDeaths: yearWeekDeaths,
            yearWeekCases: yearWeekCases,
            yearWeekNotifications: yearWeekNotifications,
            percentageDeaths: percentageDeaths,
            percentageCases: percentageCases,
            maxDeaths: maxDeaths,
            maxCases: maxCases,
            maxNotifications: maxNotifications,
            yearWeekMaxDeaths: maxYearWeekDeaths,
            yearWeekMaxCases: maxYearWeekCases,
            yearWeekMaxNotifications: maxYearWeekNotifications,
            yearWeekMaxPercentageDeaths: maxPercentageDeaths,
            yearWeekMaxPercentageCases: maxPercentageCases,
            yearWeekMaxMortality: maxYearWeekMortality
        });
        

    }, [])

    return (
        <div className="App">
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <IconButton aria-label="Rewind" color="inherit" onClick={() => onRewind()}>
                        <FastRewindIcon />
                    </IconButton>
                    <IconButton aria-label="Forward" color="inherit" onClick={() => onForward()}>
                        <FastForwardIcon />
                    </IconButton>
                    <h5>Visualization of Covid-19 Data</h5>
                    <InfoDialog />
                </Toolbar>
            </AppBar>
            <div className={classes.offset} />
          
            <Grid container className={classes.container}>
                <Grid item xs={12} lg={6}>
                    <h4>Cumulative Cases for week {state.week} of {state.year}</h4>
                    <div style={calculateStyle()} className={classes.chart}>
                        <ChoroplethChart state={state} type={CASES_CUMULATIVE} />
                    </div>
                </Grid>
                <Grid item xs={12} lg={6}>

                    <h4>Weekly Cases for week {state.week} of {state.year}</h4>
                    <div style={calculateStyle()} className={classes.chart}>
                        <ChoroplethChart state={state} type={CASES_YEARWEEK} />
                    </div>
                </Grid>
                <Grid item xs={12} lg={6}>

                    <h4>% of Cases by population for week {state.week} of {state.year}</h4>
                    <div style={calculateStyle()} className={classes.chart}>
                        <ChoroplethChart state={state} type={CASES_PERCENTAGE_YEARWEEK} />
                    </div>
                </Grid>
                <Grid item xs={12} lg={6}>

                    <h4>% Mortality for week {state.week} of {state.year}</h4>
                    <div style={calculateStyle()} className={classes.chart}>
                        <ChoroplethChart state={state} type={MORTALITY_YEARWEEK} />
                    </div>
                </Grid>
              
            </Grid>

        </div>
    );
}


const ChoroplethChart = ({ state, type, classes }) => {
    let currentData;
    let domain = 0;
    switch (type) {
        case CASES_PERCENTAGE_YEARWEEK:
            currentData = state.percentageCases;
            domain = state.yearWeekMaxPercentageCases;
            break;
        case CASES_YEARWEEK:
            currentData = state.yearWeekCases;
            domain = state.yearWeekMaxCases;
            break;
        case CASES_CUMULATIVE:
            currentData = state.cases;
            domain = state.maxCases;
            break;
        case MORTALITY_YEARWEEK:
            currentData = state.yearWeekMortality;
            domain = state.yearWeekMaxMortality;
            break;
    }

    return <ResponsiveChoropleth
        data={currentData}
        features={countries.features}
        colors="YlOrRd"
        domain={[0, domain]}
        unknownColor="#666666"
        label="properties.name"
        valueFormat=".2s"
        projectionTranslation={[0.5, 0.5]}
        enableGraticule={true}
        graticuleLineColor="#dddddd"
        borderWidth={0.5}
        borderColor="#152538"
        legends={[
            {
                anchor: "bottom-left",
                direction: "column",
                justify: true,
                translateX: 20,
                translateY: -100,
                itemsSpacing: 0,
                itemWidth: 94,
                itemHeight: 18,
                itemDirection: "left-to-right",
                itemTextColor: "#444444",
                itemOpacity: 0.85,
                symbolSize: 18,
                effects: [
                    {
                        on: "hover",
                        style: {
                            itemTextColor: "#000000",
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
        />
 }


export default App;
