/* Test-only WebKit GTK probe, compiled to LD_PRELOAD by linux_appimage_smoke.py.
 * Not linked to, packaged with, or enabled by the distributed application. */
#define _GNU_SOURCE
#include <dlfcn.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
typedef void (*Eval)(void*,const char*,long,const char*,const char*,void*,void(*)(void*,void*,void*),void*);
static Eval eval;
static void* webview;
static char* code;
static int ticks=0,busy=0,started=0;
static void* (*finish_eval)(void*,void*,void**);
static char* (*value_string)(void*);
static void (*unref)(void*);
static void (*gfree)(void*);
static void result(void* obj,void* res,void* data){
 void* err=NULL;void* v=finish_eval(obj,res,&err);busy=0;
 if(v){char* text=value_string(v);if(text){if(strcmp(text,"null")!=0){const char* out=getenv("GUMFLOW_PROBE_OUT");if(out){FILE*f=fopen(out,"w");if(f){fputs(text,f);fclose(f);}}}gfree(text);}unref(v);}
}
static int tick(void* data){
 if(busy)return 1;
 if(++ticks>160){fprintf(stderr,"GUMFLOW_PROBE_TIMEOUT\n");return 0;}
 busy=1;
 const char* js=started?"JSON.stringify(window.__gfNativeReport||null)":code; started=1;
 eval(webview,js,-1,NULL,NULL,NULL,result,NULL);return 1;
}
static void loaded(void* view,int event,void* data){
 if(event!=3||started)return;
 webview=view;
 const char* file=getenv("GUMFLOW_PROBE_JS");if(!file)return;
 FILE*f=fopen(file,"rb");if(!f)return;fseek(f,0,SEEK_END);long n=ftell(f);rewind(f);code=calloc(n+1,1);fread(code,1,n,f);fclose(f);
 eval=dlsym(RTLD_NEXT,"webkit_web_view_evaluate_javascript");finish_eval=dlsym(RTLD_NEXT,"webkit_web_view_evaluate_javascript_finish");value_string=dlsym(RTLD_NEXT,"jsc_value_to_string");unref=dlsym(RTLD_NEXT,"g_object_unref");gfree=dlsym(RTLD_NEXT,"g_free");
 if(!eval||!finish_eval||!value_string){fprintf(stderr,"Probe WebKit API missing\n");return;}
 unsigned (*timer)(unsigned,int(*)(void*),void*)=dlsym(RTLD_NEXT,"g_timeout_add");timer(500,tick,NULL);
}
void webkit_web_view_load_uri(void* view,const char* uri){
 void(*orig)(void*,const char*)=dlsym(RTLD_NEXT,"webkit_web_view_load_uri");
 unsigned long(*connect)(void*,const char*,void*,void*,void*,int)=dlsym(RTLD_NEXT,"g_signal_connect_data");
 if(getenv("GUMFLOW_PROBE_JS"))connect(view,"load-changed",loaded,NULL,NULL,0);
 // Used only for local verification when no Rust compiler is available. CI
 // does NOT set this: it tests the exact assets embedded in the new executable.
 const char* html_path=getenv("GUMFLOW_PROBE_HTML");
 if(html_path){
   FILE*f=fopen(html_path,"rb");
   if(!f){fprintf(stderr,"Cannot open probe HTML override\n");exit(5);}
   fseek(f,0,SEEK_END);long size=ftell(f);rewind(f);
   char* html=calloc(size+1,1);if(!html){exit(5);}
   if(fread(html,1,size,f)!=(size_t)size){exit(5);}fclose(f);
   void(*load_html)(void*,const char*,const char*)=dlsym(RTLD_NEXT,"webkit_web_view_load_html");
   load_html(view,html,"tauri://localhost/index.html");free(html);
 }else orig(view,uri);
}
