package com.fileshare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LanFileShareApplication {

	public static void main(String[] args) {
		SpringApplication.run(LanFileShareApplication.class, args);
	}

}
