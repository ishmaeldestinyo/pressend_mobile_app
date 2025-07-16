package com.verzap_mobile

import android.animation.Animator
import android.content.Intent
import android.os.Bundle
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.airbnb.lottie.LottieAnimationView
import com.airbnb.lottie.LottieDrawable

class LottieSplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val animationView = LottieAnimationView(this).apply {
            setAnimation("initiativeCompany.json") // File must be in assets/
            repeatCount = 0
            repeatMode = LottieDrawable.RESTART
            playAnimation()

            // Make it fill the screen
            layoutParams = FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )

            // Scale it properly
            scaleType = android.widget.ImageView.ScaleType.CENTER_CROP
        }

        setContentView(animationView)

        animationView.addAnimatorListener(object : Animator.AnimatorListener {
            override fun onAnimationEnd(animation: Animator) {
                startActivity(Intent(this@LottieSplashActivity, MainActivity::class.java))
                finish()
            }

            override fun onAnimationStart(animation: Animator) {}
            override fun onAnimationCancel(animation: Animator) {}
            override fun onAnimationRepeat(animation: Animator) {}
        })
    }
}
