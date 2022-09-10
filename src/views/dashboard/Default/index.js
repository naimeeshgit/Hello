import React, { useState, Component, useEffect } from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import { tableCellClasses } from '@mui/material/TableCell';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Plotly from 'plotly.js-dist';
import Paper from '@mui/material/Paper';
import { TableContainer } from '@mui/material';
import { TablePagination } from '@mui/material';
import ReactLoading from "react-loading";

function Dashboard() {
	const [loadData, setData] = useState(null);
	const [columns, setColumns] = useState([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const cols = ["Flow-Rate", "Volume"];

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(event.target.value, 10);
		setPage(0);
	};

	// Function toget all the fields from the channel
	const getColumns = (data) => {
		var tempColumns = []
		for (var key in data[0]) {
			tempColumns.push(key);
		}
		return tempColumns;
	};

	const changeKeyName = (data) => {
		for (var i = 0; i < data.length; i++) {
			for (var key in data[i]) {
				if (key == 'created_at') {
					data[i]['Timestamp'] = data[i][key];
					delete data[i][key];
				}
				else if (key == 'field1') {
					data[i]['Flow-Rate'] = data[i][key];
					delete data[i][key];
				}
				else if (key == 'field2') {
					data[i]['Volume'] = data[i][key];
					delete data[i][key];
				}
			}
		}
		return data;
	}

	const divideDate = (data) => {
		for (var i = 0; i < data.length; i++) {
			data[i]['Date'] = data[i]['created_at'].split('T')[0];
			data[i]['Time'] = data[i]['created_at'].split('T')[1].split('Z')[0];
		}
		return data;
	};

	const Input = styled('input')({
		display: 'none',
		margin: '20px auto',
		width: '100%',
		marginBottom: '1rem',
	});

	const StyledTableCell = styled(TableCell)(({ theme }) => ({
		[`&.${tableCellClasses.head}`]: {
			backgroundColor: theme.palette.common.black,
			color: theme.palette.common.white,
		},
		[`&.${tableCellClasses.body}`]: {
			fontSize: 14,
		},
	}));

	const StyledTableRow = styled(TableRow)(({ theme }) => ({
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.action.hover,
		},
		// hide last border
		'&:last-child td, &:last-child th': {
			border: 0,
		},
	}));

	const Item = styled(Paper)(({ theme }) => ({
		...theme.typography.body2,
		padding: theme.spacing(1),
		color: theme.palette.text.secondary,
	}));

	const query = "https://api.thingspeak.com/channels/1837528/feeds.json?results=200"
	// Function to extract data from thingspeak
	const handleAPIcall = (e) => {
		e.preventDefault();
		setData(null);
		axios.get(query)
			.then(res => {
				res = res.data.feeds;
				console.log(res);
				setData(changeKeyName(divideDate(res)));
				setColumns(getColumns(res));
			})
			.catch(err => {
				console.log(err);
			});
	};

	useEffect(() => {
		axios.get(query)
			.then(res => {
				res = res.data.feeds;
				console.log(res);
				setData(changeKeyName(divideDate(res)));
				setColumns(getColumns(res));
			})
			.catch(err => {
				console.log(err);
			});
	}, [])

	useEffect(() => {
		if (loadData) {
			for (var col in cols) {
				var xdata = [];
				var ydata = [];

				loadData.forEach((row) => (
					xdata.push(row.Timestamp),
					ydata.push(row[cols[col]])
				));
				var template = {
					x: xdata,
					y: ydata,
					type: 'scatter',
					mode: 'lines'
				};

				var titleString = cols[col] + " Graph"
				var xString = "Date-Time";
				var yString = "";
				if (cols[col] == "Flow-Rate")
					yString = "Flow-Rate (L/min)"
				else if (cols[col] == "Volume")
					yString = "Volume (L)"

				var layout = {
					xaxis: { title: xString },
					yaxis: { title: yString },
					title: titleString
				}
				console.log(cols[col]);
				Plotly.newPlot(cols[col], [template], layout);
			}
		}
	}, [loadData])

	// Function to show data in table
	const renderTable = () => {
		return (
			<Item>
				<TableContainer component={Paper}>
					<Table sx={{ minWidth: 700 }} aria-label="customized table">
						<TableHead>
							<TableRow>
								{
									columns.map((row, index) => (
										<StyledTableCell align="center" key={index}>{row}</StyledTableCell>
									))
								}
							</TableRow>
						</TableHead>
						<TableBody>
							{
								loadData
									.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
									.map((row, index) => (
										<StyledTableRow key={index}>
											{
												columns.map((r, ind) => (
													<StyledTableCell align="center" key={ind}>{row[r]}</StyledTableCell>
												))
											}
										</StyledTableRow>
									))
							}
						</TableBody>
					</Table>
					<TablePagination
						rowsPerPageOptions={[5, 10, 25]}
						component="div"
						count={loadData.length}
						rowsPerPage={rowsPerPage}
						page={page}
						onPageChange={handleChangePage}
						onRowsPerPageChange={handleChangeRowsPerPage}
					/>
				</TableContainer>
			</Item>
		);
	};

	const loadingScreen = () => {
		return (
			<ReactLoading
				type={"bars"}
				color={"#03fc4e"}
				height={100}
				width={100}
			/>);
	};

	return (
		<Grid container spacing={3}>
			<Grid item xs={12}>
			</Grid>
			{<Grid item xs={12}>
				<Button
					variant="contained"
					color="primary"
					sx={{ mx: 2 }}
					onClick={handleAPIcall}>load data</Button>
			</Grid>}
			{cols.map((col, idx) => (
				<Grid item xs={12} key={idx}>
					{loadData ? (<div id={col}></div>) : (loadingScreen())}
				</Grid>
			))}
			<Grid item xs={12}>
				{loadData ? (renderTable()) : (loadingScreen())}
			</Grid>
		</Grid>
	);

}


export default Dashboard;