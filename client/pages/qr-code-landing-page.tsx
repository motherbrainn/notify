import { Button, TextField } from "@mui/material";
import Error from "next/error";
import { useRouter } from "next/router";
import { ChangeEvent, SetStateAction, useEffect, useState } from "react";
import {
  retrieveQrCodeRecord,
  sendNotification,
} from "../service/httpRequests";
import styles from "../styles/Home.module.css";

interface QrCodeLandingPagePropsType {
  qrkey: string;
  errorCode: null | number;
}
interface InitialPropsType {
  query: QrCodeLandingPagePropsType;
}

const QrCodeLandingPage = (props: QrCodeLandingPagePropsType) => {
  const router = useRouter();

  const [qrKey, setQrKey] = useState("");
  const [notificationData, setNotificationData] = useState();
  const [allowMemo, setAllowMemo] = useState(false);
  const [qrCodeActive, setQrCodeActive] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [qrCodeNotFound, setQrCodeNotFound] =
    useState<SetStateAction<undefined | number>>();

  const onClickHandler = () => {
    //send notification, reset memo text, send user to confirmation page
    sendNotification(qrKey, memoText);
    setMemoText("");
    router.push("/notification-sent");
  };

  useEffect(() => {
    const fetchData = async () => {
      //set qr key for when we send notification
      setQrKey(props.qrkey);
      const qrCodeData = await retrieveQrCodeRecord(props.qrkey);

      if (qrCodeData.data.getRecords.length !== 0) {
        setQrCodeActive(qrCodeData.data.getRecords[0].active);
        setNotificationData(qrCodeData.data.getRecords[0].prompt_content);
        setAllowMemo(qrCodeData.data.getRecords[0].allow_memo);
      } else setQrCodeNotFound(404);
    };
    if (props.qrkey) {
      fetchData();
    }
  }, [notificationData, props, props.qrkey]);

  const handleMemoChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setMemoText(e.target.value);
  };

  return (
    <div className={styles.container}>
      {(props.errorCode || qrCodeNotFound) && <Error statusCode={404} />}
      {notificationData && qrCodeActive === true && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <h1>{notificationData}</h1>
          {allowMemo && (
            <TextField
              id="outlined-multiline-static"
              label="Add custom notification details (optional)"
              multiline
              rows={4}
              value={memoText}
              onChange={handleMemoChange}
              margin="normal"
              sx={{ width: 400 }}
            />
          )}
          <div style={{ margin: "10px" }}>
            <Button size="medium" variant="contained" onClick={onClickHandler}>
              Send Notification
            </Button>
          </div>
        </div>
      )}
      {qrCodeActive === false && (
        <div>
          QR Code is not active. Check your phone to opt in then refresh the
          page.
        </div>
      )}
    </div>
  );
};

QrCodeLandingPage.getInitialProps = async ({ query }: InitialPropsType) => {
  return query.qrkey
    ? { ...query, errorCode: null }
    : { qrkey: null, errorCode: 404 };
};

export default QrCodeLandingPage;
