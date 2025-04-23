'use server';

import { db } from '@/lib/db';
import axios from 'axios';

interface BkashConfig {
  base_url?: string;
  username?: string;
  password?: string;
  app_key?: string;
  app_secret?: string;
}

interface PaymentDetails {
  amount: number;
  callbackURL: string;
  orderID: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
}

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function createPayment(
  bkashConfig: BkashConfig,
  paymentDetails: PaymentDetails
) {
  try {
    const { amount, callbackURL, orderID, reference } = paymentDetails;

    if (!amount || amount < 1) {
      return {
        statusCode: 2065,
        statusMessage: !amount ? 'amount required' : 'minimum amount 1',
      };
    }

    if (!callbackURL) {
      return {
        statusCode: 2065,
        statusMessage: 'callbackURL required',
      };
    }

    const response = await axios.post(
      `${bkashConfig?.base_url}/tokenized/checkout/create`,
      {
        mode: '0011',
        currency: 'BDT',
        intent: 'sale',
        amount,
        callbackURL,
        payerReference: reference || '1',
        merchantInvoiceNumber: orderID,
      },
      {
        headers: await authHeaders(bkashConfig),
      }
    );

    return response?.data;
  } catch (e: any) {
    console.error(
      'Create Bkash Payment Error:',
      e?.response?.data || e.message
    );
    return {
      statusCode: 500,
      statusMessage: 'Failed to create payment',
      error: e?.response?.data || e.message,
    };
  }
}

export async function executePayment(
  bkashConfig: BkashConfig,
  paymentID: string
) {
  try {
    const response = await axios.post(
      `${bkashConfig?.base_url}/tokenized/checkout/execute`,
      { paymentID },
      {
        headers: await authHeaders(bkashConfig),
      }
    );

    return response?.data;
  } catch (error: any) {
    console.error(
      'Bkash executePayment Error:',
      error?.response?.data || error.message
    );
    return {
      statusCode: 500,
      statusMessage: 'Failed to execute payment',
      error: error?.response?.data || error.message,
    };
  }
}

const authHeaders = async (bkashConfig: BkashConfig) => {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    authorization: await grantToken(bkashConfig),
    'x-app-key': bkashConfig?.app_key!,
  };
};

const grantToken = async (bkashConfig: BkashConfig) => {
  try {
    const findToken = await db.bkashToken.findFirst({});

    if (!findToken || isTokenExpired(findToken.updatedAt)) {
      return await setToken(bkashConfig);
    }

    return findToken.token;
  } catch (e: any) {
    console.error('Grant Token Error:', e?.response?.data || e.message);
    return null;
  }
};

const setToken = async (bkashConfig: BkashConfig) => {
  const response = await axios.post(
    `${bkashConfig?.base_url}/tokenized/checkout/token/grant`,
    tokenParameters(bkashConfig),
    {
      headers: tokenHeaders(bkashConfig),
    }
  );

  const idToken = response?.data?.id_token;
  if (idToken) {
    const existingToken = await db.bkashToken.findFirst();

    if (existingToken) {
      await db.bkashToken.update({
        where: { id: existingToken.id },
        data: {
          token: idToken,
        },
      });
    } else {
      await db.bkashToken.create({
        data: {
          token: idToken,
        },
      });
    }
  }

  return idToken;
};

const isTokenExpired = (date: Date) => {
  return date < new Date(Date.now() - TOKEN_EXPIRY_MS);
};

const tokenParameters = (bkashConfig: BkashConfig) => ({
  app_key: bkashConfig?.app_key,
  app_secret: bkashConfig?.app_secret,
});

const tokenHeaders = (bkashConfig: BkashConfig) => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  username: bkashConfig?.username!,
  password: bkashConfig?.password!,
});
