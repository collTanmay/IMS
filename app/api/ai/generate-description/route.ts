import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let productName = 'Product';
  
  try {
    const body = await req.json()
    productName = body.productName || 'Product';
    const type = body.type || 'item';
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: `Write a professional 2-sentence product description for a ${type} called "${productName}" for an inventory system.`,
          parameters: { max_new_tokens: 100, temperature: 0.7 }
        })
      }
    )
    
    const data = await response.json()
    
    let description = ''
    if (Array.isArray(data) && data[0]?.generated_text) {
      description = data[0].generated_text.split('?').pop()?.trim() || 
                   `High-quality ${productName} for industrial use.`
    } else {
      description = `${productName} - Premium quality ${type} for industrial applications.`
    }
    
    return NextResponse.json({ description })
  } catch (error) {
    console.error('AI generation failed:', error)
    return NextResponse.json({ 
      description: `Professional grade ${productName}. Ideal for manufacturing and industrial use.`
    })
  }
}