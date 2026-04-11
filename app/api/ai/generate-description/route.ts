import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { productName, type } = await req.json()
    
    // Using FREE Hugging Face inference API (no API key needed for basic models)
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: `Write a professional 2-sentence product description for a ${type} called "${productName}" for an inventory system. Be specific and business-like.`,
          parameters: { max_new_tokens: 100, temperature: 0.7 }
        })
      }
    )
    
    const data = await response.json()
    
    let description = ''
    if (Array.isArray(data) && data[0]?.generated_text) {
      description = data[0].generated_text.split('?').pop()?.trim() || 
                   `High-quality ${productName} for industrial use. Essential ${type} for manufacturing operations.`
    } else {
      // Fallback descriptions
      description = `${productName} - Premium quality ${type} for industrial applications. Suitable for SME manufacturing and production workflows.`
    }
    
    return NextResponse.json({ description })
  } catch (error) {
    console.error('AI generation failed:', error)
    // Fallback description
    return NextResponse.json({ 
      description: `Professional grade ${productName}. Ideal for manufacturing and industrial use.`
    })
  }
}
