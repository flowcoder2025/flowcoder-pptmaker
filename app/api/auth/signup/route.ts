/**
 * 회원가입 API
 *
 * POST /api/auth/signup
 * - 이메일/패스워드로 신규 사용자 생성
 * - bcryptjs로 패스워드 해싱
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = body

    // 유효성 검사
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호를 입력해주세요' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 해요' },
        { status: 400 }
      )
    }

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일이에요' },
        { status: 400 }
      )
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12)

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0], // 이름이 없으면 이메일 앞부분 사용
      },
    })

    return NextResponse.json(
      {
        message: '회원가입이 완료됐어요! 로그인해주세요',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('회원가입 에러:', error)
    return NextResponse.json(
      { error: '회원가입 중 문제가 발생했어요. 다시 시도해주세요' },
      { status: 500 }
    )
  }
}
