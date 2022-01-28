import React, { useState, useEffect } from "react";
import { List, Avatar, Row, Col, Spin, Select, DatePicker, Button } from "antd";
import VirtualList from "rc-virtual-list";
import {
    CloseCircleOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { withRouter } from "react-router";
import { addQuery, removeQuery } from "./utils/utils-router";
import { browserHistory } from "react-router";

const { Option } = Select;

const ContainerHeight = 300;

const App = () => {
    const location = Object.assign({}, browserHistory.getCurrentLocation());
    console.log(location);
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [lunchSucceed, setLunchSucceed] = useState(
        location.query.launch_success
    );
    const [upcoming, setUpcoming] = useState(
        location.query.upcoming ? location.query.upcoming : ""
    );
    const [start, setStart] = useState(
        location.query.start ? moment(location.query.start) : ""
    );
    const [end, setEnd] = useState(
        location.query.end ? moment(location.query.end) : ""
    );
    const [date, setDate] = useState(null);
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    const appendData = async (reset = false) => {
        setLoading(true);
        await fetch(
            `https://api.spacexdata.com/v3/launches/${upcoming}${location.search}`
        )
            .then((res) => res.json())
            .then((body) => {
                setLoading(false);
                if (reset) {
                    setData([]);
                    setData(body);
                } else {
                    setData(data.concat(body));
                }
            });
    };

    useEffect(async () => {
        addQuery({ limit: 20 });
        await appendData();
    }, []);

    const onScroll = async (e) => {
        if (e.target.scrollHeight - e.target.scrollTop === ContainerHeight) {
            await appendData();
        }
    };
    const renderSuccess = (status) => {
        console.log(status);
        if (status === true)
            return (
                <CheckCircleOutlined
                    style={{ color: "green", fontSize: "30px" }}
                />
            );
        return (
            <CloseCircleOutlined style={{ color: "red", fontSize: "30px" }} />
        );
    };
    const handleSearch = async () => {
        await appendData(true);
    };
    const handleSetUpcoming = async (val) => {
        setUpcoming(val);
        addQuery({ upcoming: val });
    };
    const handleAddToFavorite = async (val) => {
        let arr = [];
        let favorites = localStorage.getItem("favorite")
            ? JSON.parse(localStorage.getItem("favorite"))
            : [];
        arr = [val, ...favorites];
        if (findItem(val.flight_number) < 0) {
            document.getElementById(val.flight_number).innerHTML = ` <div
                                                                        style='
                                                                            width: 120px;
                                                                            text-align: center;
                                                                            background: lightgreen;
                                                                            margin-left: 20px;
                                                                        '
                                                                    >
                                                                        is favorite!
                                                                    </div>`;
            localStorage.setItem("favorite", JSON.stringify(arr));
        }
    };
    const findItem = (id) => {
        let favorites = localStorage.getItem("favorite")
            ? JSON.parse(localStorage.getItem("favorite"))
            : [];
        return favorites.findIndex((record) => record.flight_number === id);
    };
    const renderButton = (item) => {
        if (findItem(item.flight_number) < 0)
            return (
                <Button
                    style={{ marginLeft: "10px" }}
                    onClick={() => handleAddToFavorite(item)}
                >
                    Add To Favorite
                </Button>
            );
        return (
            <div
                style={{
                    width: "120px",
                    textAlign: "center",
                    background: "lightgreen",
                    marginLeft: "20px",
                }}
            >
                is favorite!
            </div>
        );
    };
    return (
        <div>
            <Row
                style={{ marginTop: "100px", marginBottom: "30px" }}
                gutter={[20, 20]}
            >
                <Col span={3} offset={4}>
                    <DatePicker
                        defaultValue={start}
                        placeholder="Start"
                        style={{ width: "100%" }}
                        onChange={(val) =>
                            addQuery({
                                start: moment(val).format("YYYY-MM-DD"),
                            })
                        }
                    />
                </Col>
                <Col span={3}>
                    <DatePicker
                        defaultValue={end}
                        placeholder="End"
                        style={{ width: "100%" }}
                        onChange={(val) =>
                            addQuery({ end: moment(val).format("YYYY-MM-DD") })
                        }
                    />
                </Col>
                <Col span={3}>
                    <Select
                        placeholder="Succeeded/Unsucceeded"
                        onChange={(val) => addQuery({ launch_success: val })}
                        style={{ width: "100%" }}
                        defaultValue={lunchSucceed}
                    >
                        <Option value="true">Succeeded</Option>
                        <Option value="false">Unsucceeded</Option>
                    </Select>
                </Col>
                <Col span={3}>
                    <Select
                        placeholder="Upcoming/Past"
                        onChange={handleSetUpcoming}
                        style={{ width: "100%" }}
                        defaultValue={upcoming}
                    >
                        <Option value="upcoming">Upcoming</Option>
                        <Option value="past">Past</Option>
                    </Select>
                </Col>

                <Col span={4}>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        block
                        onClick={handleSearch}
                    >
                        Search
                    </Button>
                </Col>
            </Row>
            <Spin indicator={antIcon} spinning={loading}>
                <Row>
                    <Col
                        span={16}
                        offset={4}
                        style={{ border: "solid 1px #eee", padding: "20px" }}
                    >
                        {data.length > 0 && (
                            <List>
                                <VirtualList
                                    data={data}
                                    height={ContainerHeight}
                                    itemHeight={47}
                                    itemKey="flight_number"
                                    onScroll={onScroll}
                                >
                                    {(item) => (
                                        <List.Item key={Math.random()}>
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar
                                                        src={
                                                            item.links
                                                                .mission_patch_small
                                                        }
                                                    />
                                                }
                                                title={
                                                    <a href="javascript:void(0)">
                                                        {item.mission_name}
                                                    </a>
                                                }
                                                description={item.launch_year}
                                            />
                                            <div style={{ textAlign: "right" }}>
                                                launch_success :
                                                {renderSuccess(
                                                    item.launch_success
                                                )}
                                                <br />
                                                {item.launch_date_local}
                                            </div>
                                            <div id={item.flight_number}>
                                                {renderButton(item)}
                                            </div>
                                        </List.Item>
                                    )}
                                </VirtualList>
                            </List>
                        )}
                    </Col>
                </Row>
            </Spin>
        </div>
    );
};
export default withRouter(App);
