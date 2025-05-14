CREATE TABLE "wishlist" (
	"user_id" uuid NOT NULL,
	"medicine_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "wishlist_user_id_medicine_id_pk" PRIMARY KEY("user_id","medicine_id"),
	CONSTRAINT "wishlist_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "wishlist_medicine_id_unique" UNIQUE("medicine_id")
);
--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_medicine_id_medicines_id_fk" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE cascade ON UPDATE no action;