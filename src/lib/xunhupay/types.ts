export interface XunhuPayCreateRequest {
  version: '1.1';
  appid: string;
  trade_order_id: string;
  total_fee: string;
  title: string;
  time: string;
  notify_url: string;
  return_url?: string;
  callback_url?: string;
  plugins?: string;
  attach?: string;
  nonce_str: string;
  hash: string;
}

export interface XunhuPayCreateResponse {
  openid?: string;
  url?: string;
  url_qrcode?: string;
  errcode: number;
  errmsg?: string;
  hash?: string;
  [key: string]: unknown;
}

export interface XunhuPayQueryRequest {
  appid: string;
  out_trade_order?: string;
  open_order_id?: string;
  time: string;
  nonce_str: string;
  hash: string;
}

export interface XunhuPayQueryData {
  status?: string;
  open_order_id?: string;
  trade_order_id?: string;
  total_fee?: string;
  order_id?: string;
  [key: string]: unknown;
}

export interface XunhuPayQueryResponse {
  errcode: number;
  errmsg?: string;
  data?: XunhuPayQueryData;
  hash?: string;
  [key: string]: unknown;
}

export interface XunhuPayRefundRequest {
  appid: string;
  trade_order_id?: string;
  open_order_id?: string;
  reason?: string;
  time: string;
  nonce_str: string;
  hash: string;
}

export interface XunhuPayRefundResponse {
  trade_order_id?: string;
  transaction_id?: string;
  out_refund_no?: string;
  refund_fee?: string;
  reason?: string;
  refund_status?: string;
  refund_time?: string;
  errcode: number;
  errmsg?: string;
  hash?: string;
  [key: string]: unknown;
}
