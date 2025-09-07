package cn.xing.avatar_generator.controller;

import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.awt.Color;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.concurrent.Semaphore;

@RestController
@RequestMapping("/api/svg")
public class Svg2PngController {

    private static final Pattern TOKEN_PATTERN = Pattern.compile(
            "^==([A-Za-z0-9_]{10})\\.([A-Za-z0-9_]{9})\\.([A-Za-z0-9_]{8})$"
    );
    private static final Pattern BG_COLOR_PATTERN = Pattern.compile(
            "<rect\\s+[^>]*?width=[\"']100%[\"'][^>]*?height=[\"']100%[\"'][^>]*?fill=[\"']([^\"']+)[\"']");

    // 允许最多5个并发处理
    private static final Semaphore semaphore = new Semaphore(5);

    private boolean isValidToken(String token) {
        if (token == null) return false;
        return TOKEN_PATTERN.matcher(token).matches();
    }

    @PostMapping(value = "/toPng", consumes = "image/svg+xml", produces = "image/png")
    public ResponseEntity<byte[]> svgToPng(
            @RequestHeader(value = "token", required = false) String token,
            @RequestBody byte[] svgBytes) {
        if (!isValidToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        // 尝试获取许可
        boolean acquired = semaphore.tryAcquire();
        if (!acquired) {
            // 拒绝服务，返回自定义提示
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("当前请求拥挤，请稍后再试".getBytes(StandardCharsets.UTF_8));
        }
        try (ByteArrayInputStream svgInput = new ByteArrayInputStream(svgBytes);
             ByteArrayOutputStream pngOutput = new ByteArrayOutputStream()) {

            String svgContent = new String(svgBytes, StandardCharsets.UTF_8);

            // 解析 fill="rgb(r,g,b)" 和 fill-opacity="a"
            Pattern fillPattern = Pattern.compile("fill=[\"']rgb\\((\\d+),(\\d+),(\\d+)\\)[\"']");
            Pattern opacityPattern = Pattern.compile("fill-opacity=[\"']([01](?:\\.\\d+)?)[\"']");

            Matcher fillMatcher = fillPattern.matcher(svgContent);
            Matcher opacityMatcher = opacityPattern.matcher(svgContent);

            Color bgColor = null;
            if (fillMatcher.find()) {
                int r = Integer.parseInt(fillMatcher.group(1));
                int g = Integer.parseInt(fillMatcher.group(2));
                int b = Integer.parseInt(fillMatcher.group(3));
                float alpha = 1.0f;
                if (opacityMatcher.find()) {
                    alpha = Float.parseFloat(opacityMatcher.group(1));
                    if (alpha < 0f) alpha = 0f;
                    if (alpha > 1f) alpha = 1f;
                }
                bgColor = new Color(r, g, b, Math.round(alpha * 255));
            }

            // 后续设置背景色
            PNGTranscoder transcoder = new PNGTranscoder();
            TranscoderInput input = new TranscoderInput(svgInput);
            TranscoderOutput output = new TranscoderOutput(pngOutput);
            if (bgColor != null) {
                transcoder.addTranscodingHint(PNGTranscoder.KEY_BACKGROUND_COLOR, bgColor);
            }
            transcoder.transcode(input, output);

            byte[] pngData = pngOutput.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_PNG);
            return new ResponseEntity<>(pngData, headers, HttpStatus.OK);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage().getBytes());
        } finally {
            semaphore.release(1);
        }
    }
}