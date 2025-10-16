import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { accessKeyId, secretAccessKey, region } = await req.json()

    const sts = new STSClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    })

    const result = await sts.send(new GetCallerIdentityCommand({}))

    return NextResponse.json({
      success: true,
      message: 'AWS credentials verified successfully!',
      data: {
        account: result.Account,
        arn: result.Arn,
        userId: result.UserId,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 })
  }
}
